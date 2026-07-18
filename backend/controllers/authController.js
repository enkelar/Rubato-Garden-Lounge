import userModel from "../models/userModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { httpError } from "../utils/httpError.js";

const { Admin, validateLogin } = userModel;

export const adminLogin = asyncHandler(async (req, res) => {
  const { error } = validateLogin(req.body);
  if (error) throw httpError(400, error.details[0].message);

  const admin = await Admin.findOne({ email: req.body.email });
  if (!admin) throw httpError(400, 'Invalid email or password');

  if (!admin.isAdmin) throw httpError(403, 'Access denied. Not an admin.');

  const validPassword = await admin.comparePassword(req.body.password);
  if (!validPassword) throw httpError(400, 'Invalid email or password');

  const token = admin.generateAuthToken();

  res.status(200).json({
    message: 'Login successful',
    token,
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      isAdmin: admin.isAdmin,
    },
  });
});