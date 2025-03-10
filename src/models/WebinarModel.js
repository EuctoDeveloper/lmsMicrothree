import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import Counter from './CounterModel.js';

const webinarSchema = new mongoose.Schema({
    webinarId: {
        type: Number
    },
    hostId: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    invitees: {
        type: Array,
        default: []
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    meetingId: {
        type: Number,
        required: true
    },
    meetingPassword: {
        type: String,
        required: true
    },
});

webinarSchema.pre('save', async function(next) {
    if (this.isNew) {
        const counter = await Counter.findOneAndUpdate(
            { model: 'webinar' },
            { $inc: { sequence_value: 1 } },
            { new: true, upsert: true }
        );

        this.webinarId = counter.sequence_value;
    }
    next();
});


const Webinar = mongoose.model('Webinar', webinarSchema);

export default Webinar;