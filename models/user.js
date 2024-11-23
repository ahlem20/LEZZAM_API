const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    roles: {
        type: [String], // Updated to an array of strings
        required: true
      },
    active: {
        type: Boolean,
        default: true
    },
    email: {
        type: String,
        required: false
    }, 
    phoneNumber: {
        type: String,
        required: false
    },
    teacherName: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: false
    },
    University: {
        type: String,
        required: false
    },
    College: {
        type: String,
        required: false
    },
    Department: {
        type: String,
        required: false
    },
    Specialization: {
        type: String,
        required: false
    },
    groop: {
        type: String,
        required: false
    },
    level: {
        type: String,
        required: false
    },
     Scale: {
        type: String,
        required: false
    },
})

module.exports = mongoose.model('User', userSchema)
