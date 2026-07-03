import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import Joi from 'joi';
import passwordComplexity from 'joi-password-complexity';

const adminSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: true, immutable: true }
}, { timestamps: true });

adminSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

adminSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

adminSchema.methods.generateAuthToken = function() {
    return jwt.sign(
        { _id: this._id, name: this.name, email: this.email, isAdmin: true },
        process.env.JWTPRIVATEKEY,
        { expiresIn: '24h' }
    );
};

const Admin = mongoose.model('Admin', adminSchema);

// Used when creating admins (seed script)
const validate = (data) => {
    const schema = Joi.object({
        name: Joi.string().required().min(3).max(50).label('Name'),
        email: Joi.string().email().required().label('Email'),
        password: passwordComplexity().required().label('Password'),
    });
    return schema.validate(data);
};

// Used for login — no name required
const validateLogin = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required().label('Email'),
        password: Joi.string().required().label('Password'),
    });
    return schema.validate(data);
};

export default { Admin, validate, validateLogin };