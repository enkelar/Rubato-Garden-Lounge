import userModel from "../models/userModel.js";

const { Admin, validateLogin } = userModel;

export const adminLogin = async (req, res) => {
    try {
        const { error } = validateLogin(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const admin = await Admin.findOne({ email: req.body.email });
        if (!admin) return res.status(400).json({ message: 'Invalid email or password' });

        if (!admin.isAdmin) {
            return res.status(403).json({ message: 'Access denied. Not an admin.' });
        }

        const validPassword = await admin.comparePassword(req.body.password);
        if (!validPassword) return res.status(400).json({ message: 'Invalid email or password' });

        const token = admin.generateAuthToken();

        res.status(200).json({
            message: 'Login successful',
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                isAdmin: admin.isAdmin
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};