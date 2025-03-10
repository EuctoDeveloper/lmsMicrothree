import mongoose from 'mongoose';
import { LESSON_TYPE_ENUM } from '../helpers/constants.js';
import Counter from './CounterModel.js';

const lessonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: LESSON_TYPE_ENUM,
        required: true
    },
    source: {
        type: String,
        default: "",
        // required: true
    },
    thumbnail: {
        type: String,
        default: "",
        // required: function() {
        //     return this.type === 'video';
        // }
    },
    module: {
        type: Number,
        ref: 'Module',
        required: true
    },
    course: {
        type: Number,
        ref: 'Course',
        required: true
    },
    questions: [{
        question: {
            type: String,
            required: true
        },
        options: [{
            type: String,
            required: true
        }],
        correctAnswer: {
            type: String,
            required: true
        },
        points: {
            type: Number,
            required: true
        }
    }],
    activity: [{
        type: {
            type: String,
        },
        questions: [{
            question: {
                type: String,
            },
            answer: {
                type: mongoose.Schema.Types.Mixed,
                validate: {
                    validator: function(v) {
                        return typeof v === 'string' || typeof v === 'boolean';
                    },
                    message: props => `${props.value} is not a valid answer type!`
                }
            }
        }],
        active: {
            type: Boolean
        }

    }],
    totalGrade: {
        type: Number,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lessonId: {
        type: Number
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

lessonSchema.pre('save', async function(next) {
    if (this.isNew) {
        const counter = await Counter.findOneAndUpdate(
            { model: 'lesson' },
            { $inc: { sequence_value: 1 } },
            { new: true, upsert: true }
        );

        this.lessonId = counter.sequence_value;
    }
    next();
});

const Lesson = mongoose.model('Lesson', lessonSchema);
export default Lesson;