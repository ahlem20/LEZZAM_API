const express = require('express');
const path = require('path');
const Note = require('../models/project')
const mongoose = require('mongoose');
const router = express.Router();
const protectRoute = require("../middleware/protectRoute.js");
const {
  getNonActiveProjectsByStudentId,
  getActiveProjectsByStudentId,
    getNonActiveProjectsByTeacherName,
    getActiveProjectsByTeacherName,
    createNewProject,
    createNewTextProject,
    getAllNotes,
    updateNote,
    deleteNote,
    addNoteToProject,
    activateProjectByQrnumber,
    deleteProjectById,
} = require('../controllers/projectController'); // Adjust path if needed
const multer = require('multer');

// Set up multer storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Make sure you create this folder in your project
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

module.exports = router;

// @route POST /project/projects
// @desc Create new project
// @access Private
router.post('/projects', upload.single('pdf'), createNewProject);

// Get non-active projects by student ID
router.get('/projects/student/:studentId', getNonActiveProjectsByStudentId);
// Get =active projects by student ID
router.get('/projects/active/student/:studentId', getActiveProjectsByStudentId);

// Get non-active projects by teacher name
router.get('/projects/teacher/:teacherName/non-active', getNonActiveProjectsByTeacherName);

// Get active projects by teacher name
router.get('/active/:teacherName/:studentId', getActiveProjectsByTeacherName);

// Create a new text project (for notes)
router.post('/projects/text', createNewTextProject);

// Get all notes
router.get('/notes', getAllNotes);

// Update a note
router.patch('/notes', updateNote);

// Delete a note
router.delete('/projects/:id',deleteProjectById);

// Add a note to an existing project
router.patch('/projects/:id/note', addNoteToProject);

// Activate a project by QR number
router.patch('/projects/activate', activateProjectByQrnumber);


router.get('/get-pdf/:id', async (req, res) => {
  const { id } = req.params;
  
  // Validate if the ID is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send('Invalid project ID.');
  }

  try {
    // Find the project by _id using Mongoose's findById method
    const project = await Note.findById(id); // This returns a Promise

    if (project && project.pdf) {
      // Resolve the full path to the PDF
      const pdfPath = path.join(__dirname, '..', project.pdf); // Adjust the path if necessary

      // Serve the file to the frontend
      res.sendFile(pdfPath, err => {
        if (err) {
          res.status(500).send('File not found or an error occurred.');
        }
      });
    } else {
      res.status(404).send('Project not found or no PDF associated.');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('An error occurred while fetching the project.');
  }
});

module.exports = router;
