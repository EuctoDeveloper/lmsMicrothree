import mongoose from 'mongoose';
import Counter from './CounterModel.js';


const courseSchema = new mongoose.Schema({
    courseId: {
        type: Number
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    createdBy: {
        type: Number,
        ref: 'User',
        nullable: true,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});




courseSchema.pre('save', async function(next) {
    if (this.isNew) {
        const counter = await Counter.findOneAndUpdate(
            { model: 'course' },
            { $inc: { sequence_value: 1 } },
            { new: true, upsert: true }
        );

        this.courseId = counter.sequence_value;
    }
    next();
});

const Course = mongoose.model('Course', courseSchema);

export default Course;