import mongoose from 'mongoose';
import Counter from './CounterModel.js';

const enrollmentSchema = new mongoose.Schema({
    enrollmentId: {
        type: Number
    },
    student: {
        type: Number,
        required: true
    },
    course: {
        type: Number,
        required: true
    },
    enrolledAt: {
        type: Date,
        default: Date.now
    },
    scoredGrade: {
        type: Number,
        default: 0
    },
    attemptedGrade: {
        type: Number,
        default: 0
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date,
        default: null
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    completedPercentage: {
        type: Number,
        default: 0
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    certificate: {
        type: String,
        default: null
    }
});

enrollmentSchema.pre('save', async function(next) {
    if (this.isNew) {
        const counter = await Counter.findOneAndUpdate(
            { model: 'Enrollment' },
            { $inc: { sequence_value: 1 } },
            { new: true, upsert: true }
        );

        this.enrollmentId = counter.sequence_value;
    }
    next();
});

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
export default Enrollment;