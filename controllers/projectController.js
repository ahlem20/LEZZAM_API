const Note = require('../models/project')
const User = require('../models/user')
const asyncHandler = require('express-async-handler')

const generateUniqueQrnumber = require('../utils/generateUniqueQrnumber'); // Utility function for generating QR numbers

//get non active projects for student
const getNonActiveProjectsByStudentId = asyncHandler(async (req, res) => {
    const { studentId } = req.params;

    // Validate studentId
    if (!studentId) {
        return res.status(400).json({ message: 'Student ID is required' });
    }

    // Find non-active projects by studentId
    const projects = await Note.find({ studentId: studentId, active: false }).lean();

    // If no projects are found
    if (!projects?.length) {
        return res.status(400).json({ message: 'No non-active projects found for this student' });
    }

    res.json(projects);
});

//get non active projects for student
const getActiveProjectsByStudentId = asyncHandler(async (req, res) => {
    const { studentId } = req.params;

    // Validate studentId
    if (!studentId) {
        return res.status(400).json({ message: 'Student ID is required' });
    }

    // Find non-active projects by studentId
    const projects = await Note.find({ studentId: studentId, active: true }).lean();

    // If no projects are found
    if (!projects?.length) {
        return res.status(400).json({ message: 'No non-active projects found for this student' });
    }

    res.json(projects);
});
//get non active projects for teacher
const getNonActiveProjectsByTeacherName = asyncHandler(async (req, res) => {
    const { teacherName } = req.params;

    // Validate teacherName
    if (!teacherName) {
        return res.status(400).json({ message: 'Teacher name is required' });
    }

    // Find non-active projects by teacherName
    const projects = await Note.find({ teacherName, active: false ,studentId:null}).lean();

    // If no projects are found
    if (!projects?.length) {
        return res.status(400).json({ message: 'No non-active projects found for this teacher' });
    }

    res.json(projects);
});
const getActiveProjectsByTeacherName = asyncHandler(async (req, res) => {
    const { teacherName, studentId } = req.params;

    // Validate teacherName and studentId
    if (!teacherName) {
        return res.status(400).json({ message: 'Teacher name is required' });
    }
    if (!studentId) {
        return res.status(400).json({ message: 'Student ID is required' });
    }

    // Get all active projects from MongoDB where teacherName and studentId match
    const projects = await Note.find({ active: true, teacherName,studentId }).lean();

    // If no projects
    if (!projects?.length) {
        return res.status(400).json({ message: `No active projects found for teacher ${teacherName} and student ID ${studentId}` });
    }

    // Add username to each project if the user exists
    const projectsWithUser = await Promise.all(projects.map(async (project) => {
        const user = await User.findById(project.user).lean().exec();
        return { 
            ...project, 
            username: user ? user.username : 'Unknown User' // If no user found, assign 'Unknown User'
        };
    }));

    // Return the projects
    res.json(projectsWithUser);
});

// @desc Create new project
// @route POST /project/projects
// @access Private
const createNewProject = asyncHandler(async (req, res) => {
    const { studentId, title, scale, teacherName } = req.body;
  
    // Confirm required data
    if (!studentId || !title || !scale || !teacherName) {
      return res.status(400).json({ message: 'All fields are required' });
    }
  
    // Generate unique qrnumber
    const qrnumber = await generateUniqueQrnumber();
  
    // Handle the uploaded file (PDF)
    let pdfPath = null;
    if (req.file) {
      pdfPath = req.file.path; // Store the file path
    }
  
    // Create and store the new project
    const project = await Note.create({
      studentId,
      title,
      scale,
      teacherName,
      qrnumber,
      pdf: pdfPath, // Store PDF file path
    });
  
    if (project) {
      return res.status(201).json({ message: 'New project created' });
    } else {
      return res.status(400).json({ message: 'Invalid project data received' });
    }
  });

// @desc Create new project
// @route POST /project
// @access Private
const createNewTextProject = asyncHandler(async (req, res) => {
    const { teacherName, title, scale } = req.body

    // Confirm data
    if (!teacherName || !title || !scale) {
        return res.status(400).json({ message: 'All fields are required' })
    }
    // Create and store the new user 
    const note = await Note.create({ teacherName, title, scale })

    if (note) { // Created 
        return res.status(201).json({ message: 'New note created' })
    } else {
        return res.status(400).json({ message: 'Invalid note data received' })
    }

})

// @desc Get all notes 
// @route GET /notes
// @access Private
const getAllNotes = asyncHandler(async (req, res) => {
    // Get all notes from MongoDB
    const notes = await Note.find().lean()

    // If no notes 
    if (!notes?.length) {
        return res.status(400).json({ message: 'No notes found' })
    }

    res.json(notes)
})


// @desc Update a note
// @route PATCH /notes
// @access Private
const updateNote = asyncHandler(async (req, res) => {
    const { id, user, title, text, completed } = req.body

    // Confirm data
    if (!id || !user || !title || !text || typeof completed !== 'boolean') {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Confirm note exists to update
    const note = await Note.findById(id).exec()

    if (!note) {
        return res.status(400).json({ message: 'Note not found' })
    }

    // Check for duplicate title
    const duplicate = await Note.findOne({ title }).lean().exec()

    // Allow renaming of the original note 
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate note title' })
    }

    note.user = user
    note.title = title
    note.text = text
    note.completed = completed

    const updatedNote = await note.save()

    res.json(`'${updatedNote.title}' updated`)
})

// @desc Delete a note
// @route DELETE /notes
// @access Private
const deleteNote = asyncHandler(async (req, res) => {
    const { id } = req.body

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'Note ID required' })
    }

    // Confirm note exists to delete 
    const note = await Note.findById(id).exec()

    if (!note) {
        return res.status(400).json({ message: 'Note not found' })
    }

    const result = await note.deleteOne()

    const reply = `Note '${result.title}' with ID ${result._id} deleted`

    res.json(reply)
})

const activateProjectByQrnumber = asyncHandler(async (req, res) => {
    const { qrnumber } = req.body;

    // Validate qrnumber
    if (!qrnumber) {
        return res.status(400).json({ message: 'QR number is required' });
    }

    // Find the project by qrnumber
    const project = await Note.findOne({ qrnumber }).exec();

    if (!project) {
        return res.status(404).json({ message: 'Project not found' });
    }

    // Activate the project
    project.active = true;
    const updatedProject = await project.save();

    res.status(200).json({ message: 'Project activated', project: updatedProject });
});


//@desc Add note to an existing project
// @route PATCH /projects/:id/note
// @access Private
const addNoteToProject = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { note } = req.body;

    // Validate the note
    if (!note) {
        return res.status(400).json({ message: 'Note is required' });
    }

    // Find the project by ID
    const project = await Note.findById(id).exec();

    if (!project) {
        return res.status(404).json({ message: 'Project not found' });
    }

    // Add the note to the project
    project.note = note;

    // Save the updated project
    const updatedProject = await project.save();

    res.status(200).json({ message: 'Note added to project', project: updatedProject });
});

// Delete a project by ID
const deleteProjectById = async (req, res) => {
    try {
      const { id } = req.params;
      
      const project = await Note.findByIdAndDelete(id); // Find and delete in one step
  
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
  
      res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
      console.error('Error deleting project:', error);
      res.status(500).json({ message: 'Server error while deleting project' });
    }
  };



module.exports = {
    getAllNotes,
    createNewProject,
    updateNote,
    deleteNote,
    getActiveProjectsByTeacherName,
    getNonActiveProjectsByStudentId,
    getActiveProjectsByStudentId,
    getNonActiveProjectsByTeacherName,
    createNewTextProject,
    addNoteToProject,
    activateProjectByQrnumber,
    deleteProjectById
}