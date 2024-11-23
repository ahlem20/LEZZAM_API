const User = require('../models/user')
const Note = require('../models/project')
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')

//show student only 
//Get
const getAllStudents = asyncHandler(async (req, res) => {
    // Get all users with role 'Student' from MongoDB
    const users = await User.find({ roles: 'Student' }).select('-password').lean();

    // If no users are found
    if (!users?.length) {
        return res.status(400).json({ message: 'No users found' });
    }

    res.json(users);
});
const getStudentById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Validate ID format (assuming ObjectId format in MongoDB)
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid student ID' });
    }

    // Find the user by ID and ensure the role is 'Student'
    const user = await User.findOne({ _id: id, roles: 'Student' }).select('teacherName').lean();

    // If the user is not found or does not have the 'Student' role
    if (!user) {
        return res.status(404).json({ message: 'Student not found' });
    }

    res.json(user);
});

// Show students by teacher name
const getStudentsByTeacher = asyncHandler(async (req, res) => {
    const { teacherName } = req.query; // Get teacher name from query parameters

    // Check if teacherName is provided
    if (!teacherName) {
        return res.status(400).json({ message: 'Teacher name is required' });
    }

    // Get all students with the specified teacher name
    const students = await User.find({ roles: 'Student', teacherName: teacherName }).select('-password').lean();

    // If no students are found
    if (!students?.length) {
        return res.status(400).json({ message: 'No students found for the specified teacher' });
    }

    res.json(students);
});

//show teachers only
//Get
const getAllTeachers = asyncHandler(async (req, res) => {
    // Get all users with role 'Student' from MongoDB
    const users = await User.find({ roles: 'Teacher' }).select('-password').lean();

    // If no users are found
    if (!users?.length) {
        return res.status(400).json({ message: 'No users found' });
    }

    res.json(users);
});

//show student of the same class 
//Get
const StudentsByClass = asyncHandler(async (req, res) => {
    const { University, College, Department, Specialization, level, groop, Scale } = req.body;

    // Create a filter object based on provided criteria
    const filter = {
        roles: 'Student',
        University,
        College,
        Department,
        Specialization,
        level,
        groop,
        Scale
    };

    // Remove undefined fields from the filter
    Object.keys(filter).forEach(key => filter[key] === undefined && delete filter[key]);

    // Get students based on the filter
    const users = await User.find(filter).select('-password').lean();

    // If no users are found
    if (!users?.length) {
        return res.status(400).json({ message: 'No users found' });
    }

    res.json(users);
});

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
    // Get all users from MongoDB
    const users = await User.find().select('-password').lean()

    // If no users 
    if (!users?.length) {
        return res.status(400).json({ message: 'No users found' })
    }

    res.json(users)
})

// @desc Create new user
// @route POST /users
// @access Private
const createNewStudent = asyncHandler(async (req, res) => {
    const { username, password, roles, University, College, Department, Specialization, groop, level, Scale,teacherName } = req.body;

    // Confirm required fields
    if (!username || !password || !Array.isArray(roles) || !roles.length ) {
        return res.status(400).json({ message: 'Username, password, roles, email, and phone number are required' });
    }

    // Check for duplicate username
    const duplicate = await User.findOne({ username }).lean().exec();
    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate username' });
    }

    // Hash password
    const hashedPwd = await bcrypt.hash(password, 10); // salt rounds

    // Create the user object
    const userObject = {
        username,
        password: hashedPwd,
        roles,
        University,
        College,
        Department,
        Specialization,
        groop,
        level,
        Scale,
        teacherName
    };

    // Create and store new user
    const user = await User.create(userObject);

    if (user) { // Created 
        res.status(201).json({ message: `New user ${username} created` });
    } else {
        res.status(400).json({ message: 'Invalid user data received' });
    }
});

// @desc Create new user
// @route POST /users
// @access Private
const createNewTecher = asyncHandler(async (req, res) => {
    const { username, password, roles, email, phoneNumber} = req.body;

    // Confirm required fields
    if (!username || !password || !Array.isArray(roles) || !roles.length || !email || !phoneNumber) {
        return res.status(400).json({ message: 'Username, password, roles, email, and phone number are required' });
    }

    // Check for duplicate username
    const duplicate = await User.findOne({ username }).lean().exec();
    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate username' });
    }

    // Hash password
    const hashedPwd = await bcrypt.hash(password, 10); // salt rounds

    // Create the user object
    const userObject = {
        username,
        password: hashedPwd,
        roles,
        email,
        phoneNumber,
        description,
    };

    // Create and store new user
    const user = await User.create(userObject);

    if (user) { // Created 
        res.status(201).json({ message: `New user ${username} created` });
    } else {
        res.status(400).json({ message: 'Invalid user data received' });
    }
});

// @desc Update a user
// @route PATCH /users
// @access Private
const updateUser = asyncHandler(async (req, res) => {
    const { id, username, roles, active, password } = req.body

    // Confirm data 
    if (!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
        return res.status(400).json({ message: 'All fields except password are required' })
    }

    // Does the user exist to update?
    const user = await User.findById(id).exec()

    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    // Check for duplicate 
    const duplicate = await User.findOne({ username }).lean().exec()

    // Allow updates to the original user 
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate username' })
    }

    user.username = username
    user.roles = roles
    user.active = active

    if (password) {
        // Hash password 
        user.password = await bcrypt.hash(password, 10) // salt rounds 
    }

    const updatedUser = await user.save()

    res.json({ message: `${updatedUser.username} updated` })
})

// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.body

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'User ID Required' })
    }

    // Does the user still have assigned notes?
    const note = await Note.findOne({ user: id }).lean().exec()
    if (note) {
        return res.status(400).json({ message: 'User has assigned notes' })
    }

    // Does the user exist to delete?
    const user = await User.findById(id).exec()

    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    const result = await user.deleteOne()

    const reply = `Username ${result.username} with ID ${result._id} deleted`

    res.json(reply)
})

module.exports = {
    getAllUsers,
    createNewStudent,
    updateUser,
    deleteUser,
    getAllStudents,
    createNewTecher,
    getAllTeachers,
    StudentsByClass,
    getStudentsByTeacher,
    getStudentById
    
}
