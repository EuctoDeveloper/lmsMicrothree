import mongoose from 'mongoose';
import Counter from './CounterModel';

const DepartmentSchema = new mongoose.Schema({
    deptId: {
        type: Number,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        nullable: true,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

DepartmentSchema.pre('save', async function(next) {
    if (this.isNew) {
        const counter = await Counter.findOneAndUpdate(
            { model: 'department' },
            { $inc: { sequence_value: 1 } },
            { new: true, upsert: true }
        );

        this.deptId = counter.sequence_value;
    }
    next();
});

const Department = mongoose.model('Department', DepartmentSchema);

export default Department;