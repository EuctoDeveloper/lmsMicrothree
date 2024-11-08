import mongoose from 'mongoose';
import Counter from './CounterModel.js';


const progressModuleSchema = new mongoose.Schema({
    moduleProgressId: {
        type: Number
    },
    enrollmentId: {
        type: Number,
    },
    moduleId: {
        type: Number,
    },
    completedPercentage: {
        type: Number,
        default: 0
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});




progressModuleSchema.pre('save', async function(next) {
    if (this.isNew) {
        const counter = await Counter.findOneAndUpdate(
            { model: 'ModuleProgress' },
            { $inc: { sequence_value: 1 } },
            { new: true, upsert: true }
        );

        this.moduleProgressId = counter.sequence_value;
    }
    next();
});

const ModuleProgress = mongoose.model('ModuleProgress', progressModuleSchema);

export default ModuleProgress;