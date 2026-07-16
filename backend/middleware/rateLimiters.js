import rateLimit from 'express-rate-limit';

// sends JSON response when rate limit is hit
const jsonRateLimitHandler = (req, res) => {
    res.status(429).json({ message: 'Too many requests. Please wait a moment and try again.' });
};

// Login attempts
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // each IP can make max 5 reqs in this window
    standardHeaders: true,
    legacyHeaders: false,
    handler: jsonRateLimitHandler,
});

// admin read operations (categories, products list)
export const adminReadLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 120, // Up to 120 read requests per IP in this window
    standardHeaders: true,
    legacyHeaders: false,
    handler: jsonRateLimitHandler,
});

// admin write operations — create/update/delete
export const adminWriteLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 30, // Only 30 write requests per IP in this window
    standardHeaders: true,
    legacyHeaders: false,
    handler: jsonRateLimitHandler,
});