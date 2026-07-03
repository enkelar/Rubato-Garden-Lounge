import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    try {
        req.admin = jwt.verify(token, process.env.JWTPRIVATEKEY);
        next();
    } catch {
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

export const requireAdmin = (req, res, next) => {
    if (!req.admin || !req.admin.isAdmin) {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    next();
};