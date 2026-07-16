import jwt from 'jsonwebtoken';

// checks whether a valid token exists
export const verifyToken = (req, res, next) => {
    // read authorization header from req
    const authHeader = req.headers['authorization'];
    // extract token only if header starts with "Bearer"
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    try {
        // verify token using secret key from env, if valid, decoded payload is attached to req.admin
        req.admin = jwt.verify(token, process.env.JWTPRIVATEKEY);

        next(); // continue to next middleware/route handler
    } catch {
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

// allows only admins
export const requireAdmin = (req, res, next) => {
    // check that req.admin exists and that user has admin provileges
    if (!req.admin || !req.admin.isAdmin) {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    next(); // continue if the user is an admin
};