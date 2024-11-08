import mongoose from 'mongoose';
import Counter from './CounterModel';

const LocationSchema = new mongoose.Schema({
    locationId: {
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

LocationSchema.pre('save', async function(next) {
    if (this.isNew) {
        const counter = await Counter.findOneAndUpdate(
            { model: 'location' },
            { $inc: { sequence_value: 1 } },
            { new: true, upsert: true }
        );

        this.locationId = counter.sequence_value;
    }
    next();
});

const Location = mongoose.model('Location', LocationSchema);

export default Location;