import userModel from "../models/userModel.js";

const { Admin, validateLogin } = userModel;

export const adminLogin = async (req, res) => {
    try {

        // Validate the req body with validateLogin function, if fail 400 bad request message
        const { error } = validateLogin(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        // Search for admin user by email
        const admin = await Admin.findOne({ email: req.body.email });
        if (!admin) return res.status(400).json({ message: 'Invalid email or password' });

        // Check admin role
        if (!admin.isAdmin) {
            return res.status(403).json({ message: 'Access denied. Not an admin.' });
        }

        // Compare password to the hashed psw in the database
        const validPassword = await admin.comparePassword(req.body.password);
        if (!validPassword) return res.status(400).json({ message: 'Invalid email or password' });

        // Generate authentication token for the logged-in admin
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