import mongoose from 'mongoose';
import Counter from './CounterModel';

const CenterSchema = new mongoose.Schema({
    centerId: {
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

CenterSchema.pre('save', async function(next) {
    if (this.isNew) {
        const counter = await Counter.findOneAndUpdate(
            { model: 'center' },
            { $inc: { sequence_value: 1 } },
            { new: true, upsert: true }
        );

        this.centerId = counter.sequence_value;
    }
    next();
});

const Center = mongoose.model('Center', CenterSchema);

export default Center;