const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const projectSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: 'User'
        },
        title: {
            type: String,
            required: true
        },
        scale: {
            type: String,
            required: false
        },
        teacherName: {
            type: String,
            required: false
        },
        qrnumber: {
            type: String,
            required: false
        },
        note: {
            type: String,
            required: false
        },
        pdf: {
            type: String,
        },
        active: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

// Auto-increment plugin setup
projectSchema.plugin(AutoIncrement, {
    inc_field: 'ticket',
    id: 'ticketNums',
    start_seq: 500
});

module.exports = mongoose.model('Project', projectSchema);
