// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('❌ No token provided');
            return res.status(401).json({ success: false, message: 'Token tidak ditemukan' });
        }

        const token = authHeader.split(' ')[1];
        console.log('🔍 Verifying token');

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        console.log('✅ Token verified, user ID:', decoded.id);

        const userDoc = await db.collection('users').doc(decoded.id).get();

        if (!userDoc.exists) {
            console.log('❌ User not found in Firestore');
            return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        }

        const userData = userDoc.data();

        req.user = {
            id: decoded.id,
            role: userData.role || 'user',
            email: userData.email,
            name: userData.name
        };

        console.log('✅ Auth success:', req.user.email);
        next();

    } catch (error) {
        console.error('❌ Auth error:', error.message);
        return res.status(401).json({ success: false, message: 'Token tidak valid' });
    }
};

const adminOnly = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        console.log('❌ Not admin');
        return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses admin' });
    }
    next();
};

module.exports = { protect, adminOnly };