import mongoose from 'mongoose';
import Counter from './CounterModel';

const DesignationSchema = new mongoose.Schema({
    desgId: {
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

DesignationSchema.pre('save', async function(next) {
    if (this.isNew) {
        const counter = await Counter.findOneAndUpdate(
            { model: 'designation' },
            { $inc: { sequence_value: 1 } },
            { new: true, upsert: true }
        );

        this.desgId = counter.sequence_value;
    }
    next();
});
const Designation = mongoose.model('Designation', DesignationSchema);

export default Designation;
