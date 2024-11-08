import mongoose from 'mongoose';
import Counter from './CounterModel.js';

const NotificationSchema = new mongoose.Schema({
    notificationId: {
        type: Number,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    type: {
        type: String,
        nullable: true,
        default: null
    },
    landing: {
        type: String,
        nullable: true,
        default: null
    },
    landingId: {
        type: Number,
        nullable: true,
        default: null
    },
    landingData: {
        type: String,
        nullable: true,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    availableAt: {
        type: Date,
        required: true
    },
    expireAt: {
        type: Date,
        nullable: true,
        default: null
    },
    dirty: {
        type: Boolean,
        default: false
    },
    actioned: {
        type: Boolean,
        default: false

    },
    userId: {
        type: Number,
        required: true
    }
});

NotificationSchema.pre('save', async function(next) {
    if (this.isNew) {
        const counter = await Counter.findOneAndUpdate(
            { model: 'notification' },
            { $inc: { sequence_value: 1 } },
            { new: true, upsert: true }
        );

        this.notificationId = counter.sequence_value;
    }
    next();
});

const Notification = mongoose.model('Notification', NotificationSchema);

export default Notification;