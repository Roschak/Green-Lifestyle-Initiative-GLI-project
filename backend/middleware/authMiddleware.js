// backend/middleware/authMiddleware.js
// Middleware untuk autentikasi dan autorisasi Firebase tokens
const admin = require('firebase-admin');
const db = require('../config/db');

/**
 * Middleware protect - Validasi Firebase ID token dari Authorization header
 * Extract token dari "Bearer TOKEN"
 * Verify dengan Firebase Admin SDK
 * Attach user data ke req.user (id, role, email, name)
 * Return 401 jika token invalid atau tidak ada
 */
const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // Cek Authorization header format "Bearer TOKEN"
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('❌ No token provided');
            return res.status(401).json({ success: false, message: 'Token tidak ditemukan' });
        }

        // Extract token dari header
        const token = authHeader.split(' ')[1];
        console.log('🔍 Verifying Firebase token, length:', token.length);

        // Verify Firebase ID token validity
        const decoded = await admin.auth().verifyIdToken(token);
        console.log('✅ Firebase token verified, user ID:', decoded.uid);

        // Ambil user data dari Firestore untuk dapat role dan info lainnya
        const userDoc = await db.collection('users').doc(decoded.uid).get();

        if (!userDoc.exists) {
            console.log('❌ User not found in Firestore:', decoded.uid);
            return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        }

        const userData = userDoc.data();

        // Attach user info ke req.user untuk digunakan di controller
        req.user = {
            id: decoded.uid,
            role: userData.role || 'user',
            email: userData.email,
            name: userData.name
        };

        console.log('✅ Auth success:', req.user.email);
        next();

    } catch (error) {
        console.error('❌ Auth error:', error.code, '-', error.message);
        return res.status(401).json({ success: false, message: error.message || 'Token tidak valid' });
    }
};

/**
 * Middleware adminOnly - Check apakah user adalah admin
 * Harus digunakan setelah protect middleware
 * Return 403 jika role bukan admin
 */
const adminOnly = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        console.log('❌ Not admin');
        return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses admin' });
    }
    next();
};

module.exports = { protect, adminOnly };