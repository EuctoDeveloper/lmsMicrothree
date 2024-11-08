import mongoose from 'mongoose';
import Counter from './CounterModel.js';

const courseCriteriaSchema = new mongoose.Schema({
    courseCriteriaId: {
        type: Number,
        unique: true
    },
    courseId: {
        type: Number,
        ref: 'Course',
        required: true
    },
    userRole: {
        type: Array,
        default: ['*'],
        nullable: false
    },
    location: {
        type: Array,
        default: ['*'],
        nullable: false
    },
    department: {
        type: Array,
        default: ['*'],
        nullable: false
    },
    group: {
        type: Array,
        default: ['*'],
        nullable: false
    },
    center: {
        type: Array,
        default: ['*'],
        nullable: false
    },
    designation: {
        type: Array,
        default: ['*'],
        nullable: false
    },
    branch: {
        type: Array,
        default: ['*'],
        nullable: false
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

courseCriteriaSchema.pre('save', async function(next) {
    if (this.isNew) {
        const counter = await Counter.findOneAndUpdate(
            { model: 'CourseCriterias' },
            { $inc: { sequence_value: 1 } },
            { new: true, upsert: true }
        );
        this.courseCriteriaId = counter.sequence_value || 1;
    }
    next();
});

const CourseCriteria = mongoose.model('courseCriteria', courseCriteriaSchema);

export default CourseCriteria;