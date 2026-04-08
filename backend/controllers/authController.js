// backend/controllers/authController.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');

const makeToken = (id, role) => 
    jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    
    if (!email || !password || !name) {
        return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
    }

    try {
        const existing = await db.collection('users')
            .where('email', '==', email.toLowerCase())
            .limit(1)
            .get();

        if (!existing.empty) {
            return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
        }

        const hashed = await bcrypt.hash(password, 10);

        const docRef = await db.collection('users').add({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashed,
            role: 'user',
            points: 0,
            monthly_points: 0,
            level: 'Eco-Newbie',
            medal: '',
            status: 'offline',
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log('✅ User registered:', docRef.id);

        return res.status(201).json({ 
            success: true, 
            message: 'Registrasi berhasil! Silakan login.' 
        });

    } catch (err) {
        console.error('❌ Register Error:', err);
        return res.status(500).json({ success: false, message: 'Gagal registrasi' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email dan password wajib diisi' });
    }

    try {
        const userSnap = await db.collection('users')
            .where('email', '==', email.toLowerCase())
            .limit(1)
            .get();

        if (userSnap.empty) {
            return res.status(401).json({ success: false, message: 'Email atau password salah' });
        }

        const user = { id: userSnap.docs[0].id, ...userSnap.docs[0].data() };
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Email atau password salah' });
        }

        await db.collection('users').doc(user.id).update({ 
            status: 'online',
            last_seen: admin.firestore.FieldValue.serverTimestamp()
        });

        const token = makeToken(user.id, user.role);
        const { password: _, ...safeUser } = user;

        console.log('✅ Login berhasil:', user.email);

        return res.json({ 
            success: true, 
            message: 'Login berhasil', 
            token, 
            user: safeUser 
        });

    } catch (err) {
        console.error('❌ Login Error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.logout = async (req, res) => {
    try {
        const userId = req.user?.id;
        
        if (userId) {
            await db.collection('users').doc(userId).update({ 
                status: 'offline',
                last_seen: admin.firestore.FieldValue.serverTimestamp()
            });
        }

        return res.json({ success: true, message: 'Logout berhasil' });

    } catch (err) {
        console.error('❌ Logout Error:', err);
        return res.status(500).json({ success: false, message: 'Gagal logout' });
    }
};