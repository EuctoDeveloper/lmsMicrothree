import mongoose from 'mongoose';
import Counter from './CounterModel.js';


const moduleSchema = new mongoose.Schema({
    moduleId: {
        type: Number
    },
    title: {
        type: String,
        required: true
    },
    course: {
        type: Number,
        ref: 'Course',
        required: true
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




moduleSchema.pre('save', async function(next) {
    if (this.isNew) {
        const counter = await Counter.findOneAndUpdate(
            { model: 'module' },
            { $inc: { sequence_value: 1 } },
            { new: true, upsert: true }
        );

        this.moduleId = counter.sequence_value;
    }
    next();
});

const Module = mongoose.model('Module', moduleSchema);

export default Module;