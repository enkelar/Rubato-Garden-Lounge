import rateLimit from 'express-rate-limit';

const jsonRateLimitHandler = (req, res) => {
    res.status(429).json({ message: 'Too many requests. Please wait a moment and try again.' });
};

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    handler: jsonRateLimitHandler,
});

// Generous — dashboard GETs (categories, products list)
export const adminReadLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    handler: jsonRateLimitHandler,
});

// Stricter — create/update/delete
export const adminWriteLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    handler: jsonRateLimitHandler,
});