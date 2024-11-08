import mongoose from 'mongoose';
import Counter from './CounterModel';

const GroupSchema = new mongoose.Schema({
    groupId: {
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

GroupSchema.pre('save', async function(next) {
    if (this.isNew) {
        const counter = await Counter.findOneAndUpdate(
            { model: 'group' },
            { $inc: { sequence_value: 1 } },
            { new: true, upsert: true }
        );

        this.groupId = counter.sequence_value;
    }
    next();
});

const Group = mongoose.model('Group', GroupSchema);

export default Group;