// backend/controllers/userController.js
// Handles user-related operations: action reporting, stats retrieval, profile data
const db = require('../config/db');
const admin = require('firebase-admin');

/**
 * Create Action - Endpoint untuk user submit aksi hijau baru
 * File upload optional (foto atau gambar pendukung)
 * Set status = 'pending' menunggu admin verifikasi
 * points_earned dimulai dari 0, diisi oleh admin setelah approve
 */
exports.createAction = async (req, res) => {
    try {
        const { user_id, action_name, description, location } = req.body;
        let imageUrl = null;

        // Validasi required fields
        if (!user_id || !action_name) {
            return res.status(400).json({ success: false, message: 'User ID dan nama aksi wajib' });
        }

        // Upload file jika ada
        if (req.file) {
            imageUrl = req.file.path;
            console.log('✅ Image uploaded:', imageUrl);
        }

        // Simpan action dengan status pending untuk admin review
        const docRef = await db.collection('actions').add({
            user_id,
            action_name,
            description: description || '',
            location: location || '',
            img: imageUrl,
            status: 'pending',  // Belum approved admin
            points_earned: 0,   // Akan diisi admin
            admin_note: '',
            rejection_reason: '',  // Jika di-reject
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log('✅ Action created:', docRef.id);

        return res.status(201).json({
            success: true,
            message: 'Aksi berhasil dilaporkan!',
            actionId: docRef.id
        });

    } catch (err) {
        console.error('❌ Create Action Error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * Get User Actions - Ambil riwayat aksi user (approved/pending/rejected)
 * Sort by created_at descending (terbaru duluan)
 * Convert Firestore Timestamps ke ISO string untuk JSON response
 * Fallback ke memory sort jika orderBy index error
 */
exports.getUserActions = async (req, res) => {
    try {
        const userId = req.params.id;

        // Query dengan orderBy (butuh composite index di Firestore)
        const snapshot = await db.collection('actions')
            .where('user_id', '==', userId)
            .orderBy('created_at', 'desc')
            .get();

        const actions = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            // Firestore Timestamp object harus convert ke ISO string
            if (data.created_at?.toDate) data.created_at = data.created_at.toDate().toISOString();
            if (data.updated_at?.toDate) data.updated_at = data.updated_at.toDate().toISOString();
            actions.push({ id: doc.id, ...data });
        });

        console.log(`✅ getUserActions for ${userId}: ${actions.length} actions`);
        return res.json(actions);

    } catch (err) {
        console.error('❌ Get User Actions Error:', err);
        // Jika error composite index, fallback query tanpa orderBy
        if (err.code === 9) {
            try {
                // Query without orderBy
                const snapshot = await db.collection('actions')
                    .where('user_id', '==', req.params.id)
                    .get();

                const actions = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    // Convert timestamps
                    if (data.created_at?.toDate) data.created_at = data.created_at.toDate().toISOString();
                    if (data.updated_at?.toDate) data.updated_at = data.updated_at.toDate().toISOString();
                    actions.push({ id: doc.id, ...data });
                });

                // Sort in memory by created_at descending
                actions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                console.log(`✅ getUserActions (fallback) for ${req.params.id}: ${actions.length} actions`);
                return res.json(actions);
            } catch (fallbackErr) {
                console.error('❌ Fallback error:', fallbackErr);
                // Always return array even on error (graceful degradation)
                return res.json([]);
            }
        }
        console.error('❌ Returning fallback array');
        return res.json([]);
    }
};

/**
 * Get User Stats - Ambil statistik aksi user (total points, action counts, status breakdown)
 * Return format: { totalPoints, totalActions, approved, pending, rejected }
 * Digunakan untuk dashboard user
 */
exports.getUserStats = async (req, res) => {
    try {
        const { id } = req.params;

        // Validasi user exists
        const userDoc = await db.collection('users').doc(id).get();
        if (!userDoc.exists) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }

        const user = userDoc.data();

        // Ambil semua aksi user
        const actSnap = await db.collection('actions')
            .where('user_id', '==', id)
            .get();

        const actions = [];
        actSnap.forEach(doc => actions.push(doc.data()));

        // Count aksi by status
        const approved = actions.filter(a => a.status === 'approved').length;
        const pending = actions.filter(a => a.status === 'pending').length;
        const rejected = actions.filter(a => a.status === 'rejected').length;

        return res.json({
            totalPoints: user.points || 0,  // Total poin dari semua aksi approved
            totalActions: actions.length,   // Total submission (all statuses)
            approved,   // Count aksi approved
            pending,    // Count aksi pending review
            rejected    // Count aksi rejected
        });

    } catch (err) {
        console.error('❌ Get User Stats Error:', err);
        return res.status(500).json({ message: 'Error' });
    }
};

/**
 * Get User Profile - Ambil profil lengkap user dengan ranking
 * Hitung ranking user berdasarkan monthly_points (menang terhadap berapa user)
 */
exports.getUserProfile = async (req, res) => {
    try {
        const { id } = req.params;

        // Get user data
        const userDoc = await db.collection('users').doc(id).get();
        if (!userDoc.exists) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }

        const user = userDoc.data();

        // Ambil aksi user untuk stats
        const actSnap = await db.collection('actions').where('user_id', '==', id).get();
        const actions = [];
        actSnap.forEach(doc => actions.push(doc.data()));

        const approved = actions.filter(a => a.status === 'approved').length;
        const rejected = actions.filter(a => a.status === 'rejected').length;
        const pending = actions.filter(a => a.status === 'pending').length;

        // Hitung ranking: berapa banyak user dengan monthly_points lebih tinggi
        const rankSnap = await db.collection('users')
            .where('role', '==', 'user')
            .where('monthly_points', '>', user.monthly_points || 0)
            .get();

        return res.json({
            id,
            name: user.name || '',
            email: user.email || '',
            points: user.points || 0,
            monthlyPoints: user.monthly_points || 0,
            level: user.level || 'Eco-Newbie',
            medals: user.medal ? user.medal.split(',').map(m => m.trim()) : [],
            ranking: rankSnap.size + 1,
            approved,
            rejected,
            pending
        });

    } catch (err) {
        console.error('❌ Get User Profile Error:', err);
        return res.status(500).json({ message: 'Error' });
    }
};

/**
 * Get Public Leaderboard - Peringkat untuk user (tidak perlu admin)
 * Top 10 users berdasarkan monthly_points
 * Digunakan untuk halaman Peringkat user
 */
exports.getPublicLeaderboard = async (req, res) => {
    try {
        // Try dengan orderBy dulu (jika composite index sudah dibuat)
        try {
            const snap = await db.collection('users')
                .where('role', '==', 'user')
                .orderBy('monthly_points', 'desc')
                .limit(10)
                .get();

            const data = [];
            snap.forEach((doc, index) => {
                const d = doc.data();
                data.push({
                    rank: index + 1,
                    id: doc.id,
                    name: d.name || 'User',
                    points: d.monthly_points || 0,
                    medal: d.medal || '',
                    level: d.level || 'Eco-Newbie',
                    avatar: d.avatar || null
                });
            });

            return res.json({
                success: true,
                period: 'April 2026',
                data
            });
        } catch (indexErr) {
            // Fallback: Get semua users dan sort di memory (jika index belum ada)
            console.log('📌 Fallback to memory sort for leaderboard');
            const snap = await db.collection('users')
                .where('role', '==', 'user')
                .get();

            const users = [];
            snap.forEach(doc => {
                users.push({
                    id: doc.id,
                    name: doc.data().name || 'User',
                    points: doc.data().monthly_points || 0,
                    medal: doc.data().medal || '',
                    level: doc.data().level || 'Eco-Newbie',
                    avatar: doc.data().avatar || null
                });
            });

            // Sort by points descending dan ambil top 10
            users.sort((a, b) => b.points - a.points);
            const data = users.slice(0, 10).map((u, i) => ({
                rank: i + 1,
                ...u
            }));

            return res.json({
                success: true,
                period: 'April 2026',
                data
            });
        }

    } catch (err) {
        console.error('❌ Public Leaderboard Error:', err);
        return res.status(500).json({ success: false, message: 'Error fetching leaderboard' });
    }
};