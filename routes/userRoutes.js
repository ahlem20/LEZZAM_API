const express = require('express');
const router = express.Router();
const protectRoute = require("../middleware/protectRoute.js");
const {
    getAllUsers,
    createNewStudent,
    createNewTecher,
    getAllStudents,
    getAllTeachers,
    StudentsByClass,
    getStudentsByTeacher,
    getStudentById
} = require('../controllers/userController');

// Get all users
router.get('/', protectRoute,getAllUsers);

// Get all students
router.get('/students',getAllStudents);

// Get all teachers
router.get('/teacher', getAllTeachers);


// Define the route for getting teacher names by ID
router.get('/teacherNames/:id', getStudentById);

// Get students by class
router.post('/students/class',StudentsByClass);

// Create a new student
router.post('/students', createNewStudent);

// Create a new teacher
router.post('/teachers',createNewTecher);

router.get('/students?teacherName',getStudentsByTeacher);


module.exports = router;
