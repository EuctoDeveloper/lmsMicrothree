import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import Counter from './CounterModel.js';
import { USER_ROLE_ENUM } from '../helpers/constants.js';

const userSchema = new mongoose.Schema({
    userId: {
        type: Number
    },
    externalId: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: USER_ROLE_ENUM,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    locationId: {
        type: Number,
        ref: 'Location',
        validate: {
            validator: function (value) {
                if (this.role === 'client' && !value) {
                    return false;
                }
                return true;
            },
            message: 'Office Branch is required'
        }
    },
    centerId: {
        type: Number,
        ref: 'Center',
        validate: {
            validator: function (value) {
                if (this.role === 'client' && !value) {
                    return false;
                }
                return true;
            },
            message: 'Office Branch is required'
        }
    },
    groupId: {
        type: Number,
        ref: 'Group',
        validate: {
            validator: function (value) {
                if (this.role === 'client' && !value) {
                    return false;
                }
                return true;
            },
            message: 'Office Branch is required'
        }
    },
    departmentId: {
        type: Number,
        ref: 'Department',
        validate: {
            validator: function (value) {
                if (this.role === 'employee' && !value) {
                    return false;
                }
                return true;
            },
            message: 'Office Branch is required'
        }
    },
    designationId: {
        type: Number,
        ref: 'Designation',
        validate: {
            validator: function (value) {
                if (this.role === 'employee' && !value) {
                    return false;
                }
                return true;
            },
            message: 'Office Branch is required'
        }
    },
    branchId: {
        type: Number,
        ref: 'Branch',
        validate: {
            validator: function (value) {
                if (this.role === 'employee' && !value) {
                    return false;
                }
                return true;
            },
            message: 'Office Branch is required'
        }
    },
    refreshTokens: {
        type: Array,
        default: []
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

userSchema.pre('save', async function(next) {
    try {
        if (!this.isModified('password')) {
            return next();
        }

        const salt = await bcrypt.genSalt(10);

        this.password = await bcrypt.hash(this.password, salt);

        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function(next) {
    if (this.isNew) {
        const counter = await Counter.findOneAndUpdate(
            { model: 'user' },
            { $inc: { sequence_value: 1 } },
            { new: true, upsert: true }
        );

        this.userId = counter.sequence_value;
    }
    next();
});


const User = mongoose.model('User', userSchema);

export default User;