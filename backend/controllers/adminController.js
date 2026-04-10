// backend/controllers/adminController.js
const db = require('../config/db');
const admin = require('firebase-admin');

exports.getDashboardStats = async (req, res) => {
    try {
        const usersSnap = await db.collection('users').where('role', '==', 'user').get();
        const actSnap = await db.collection('actions').get();
        const eventSnap = await db.collection('events').get();

        const actions = [];
        actSnap.forEach(doc => actions.push(doc.data()));

        const pending = actions.filter(a => a.status === 'pending').length;
        const rejected = actions.filter(a => a.status === 'rejected').length;
        const approved = actions.filter(a => a.status === 'approved').length;

        return res.json({
            totalUsers: usersSnap.size,
            totalActions: actSnap.size,
            totalEvents: eventSnap.size,
            pending,
            rejected,
            approved,
            onlineUsers: usersSnap.docs.filter(d => d.data().status === 'online').length
        });

    } catch (err) {
        console.error('❌ Dashboard Stats Error:', err);
        return res.status(500).json({ success: false, message: 'Error' });
    }
};

exports.getAdminStats = async (req, res) => {
    try {
        const actSnap = await db.collection('actions').get();
        const actions = [];
        actSnap.forEach(doc => actions.push(doc.data()));

        const userSnap = await db.collection('users').where('role', '==', 'user').get();
        const onlineSnap = await db.collection('users').where('status', '==', 'online').get();

        return res.json({
            totalVerified: actions.filter(a => a.status !== 'pending').length,
            approved: actions.filter(a => a.status === 'approved').length,
            rejected: actions.filter(a => a.status === 'rejected').length,
            pending: actions.filter(a => a.status === 'pending').length,
            totalUsers: userSnap.size,
            onlineUsers: onlineSnap.size
        });

    } catch (err) {
        console.error('❌ Admin Stats Error:', err);
        return res.status(500).json({ success: false, message: 'Error' });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const snap = await db.collection('users').where('role', '==', 'user').get();
        const users = [];
        const now = new Date();
        const OFFLINE_THRESHOLD = 10 * 60 * 1000; // 10 menit dalam milliseconds

        snap.forEach(doc => {
            const data = doc.data();
            
            // ✅ FIXED: Auto-set offline jika last_activity > 10 menit
            let status = data.status || 'offline';
            if (data.last_activity) {
                const lastActivityTime = data.last_activity.toDate?.() || new Date(data.last_activity);
                const timeSinceActivity = now - lastActivityTime;
                
                if (timeSinceActivity > OFFLINE_THRESHOLD) {
                    status = 'offline';  // Auto-offline setelah 10 menit
                }
            }
            
            users.push({
                id: doc.id,
                name: data.name || '',
                email: data.email || '',
                level: data.level || 'Eco-Newbie',
                medal: data.medal || '',
                points: data.points || 0,
                monthly_points: data.monthly_points || 0,
                status: status  // Updated status
            });
        });

        users.sort((a, b) => (b.monthly_points || 0) - (a.monthly_points || 0));

        return res.json(users);

    } catch (err) {
        console.error('❌ Get Users Error:', err);
        return res.status(500).json({ success: false, message: 'Error' });
    }
};

exports.getUserDetail = async (req, res) => {
    try {
        const { id } = req.params;

        const userDoc = await db.collection('users').doc(id).get();
        if (!userDoc.exists) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        }

        const user = userDoc.data();
        const actSnap = await db.collection('actions').where('user_id', '==', id).get();
        const actions = [];
        actSnap.forEach(doc => actions.push(doc.data()));

        const approved = actions.filter(a => a.status === 'approved').length;
        const rejected = actions.filter(a => a.status === 'rejected').length;
        const pending = actions.filter(a => a.status === 'pending').length;

        // ✅ FIXED: Calculate ranking dengan fallback untuk composite index
        let ranking = 1;
        try {
            const rankSnap = await db.collection('users')
                .where('role', '==', 'user')
                .where('monthly_points', '>', user.monthly_points || 0)
                .get();
            ranking = rankSnap.size + 1;
        } catch (indexErr) {
            // Fallback: Get semua users dan count manual
            console.log('📌 Fallback: calculating ranking manually');
            const allUsersSnap = await db.collection('users')
                .where('role', '==', 'user')
                .get();

            let betterCount = 0;
            allUsersSnap.forEach(doc => {
                if ((doc.data().monthly_points || 0) > (user.monthly_points || 0)) {
                    betterCount++;
                }
            });
            ranking = betterCount + 1;
        }

        return res.json({
            id,
            name: user.name || '',
            email: user.email || '',
            points: user.points || 0,
            monthly_points: user.monthly_points || 0,
            level: user.level || 'Eco-Newbie',
            medal: user.medal || '',
            ranking,
            total_actions: actions.length,
            approved,
            rejected,
            pending
        });

    } catch (err) {
        console.error('❌ Get User Detail Error:', err);
        return res.status(500).json({ success: false, message: 'Error: ' + err.message });
    }
};

exports.getAllActions = async (req, res) => {
    try {
        const snap = await db.collection('actions').orderBy('created_at', 'desc').get();
        const actions = [];

        for (const doc of snap.docs) {
            const data = doc.data();
            const userDoc = await db.collection('users').doc(data.user_id).get();
            actions.push({
                id: doc.id,
                user_name: userDoc.exists ? userDoc.data().name : 'Unknown',
                ...data
            });
        }

        console.log(`✅ getAllActions: ${actions.length} actions found`);
        return res.json(actions);

    } catch (err) {
        console.error('❌ Get All Actions Error:', err);
        // Always return an array, even on error
        return res.json([]);
    }
};

exports.verifyAction = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, points_earned, admin_note, rejection_reason } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Status tidak valid' });
        }

        // ✅ FIX: Points must be > 0 if approved
        if (status === 'approved' && (!points_earned || Number(points_earned) <= 0)) {
            return res.status(400).json({ success: false, message: 'Poin harus lebih dari 0' });
        }

        const actionRef = db.collection('actions').doc(id);
        const actionDoc = await actionRef.get();

        if (!actionDoc.exists) {
            return res.status(404).json({ success: false, message: 'Action tidak ditemukan' });
        }

        const actionData = actionDoc.data();
        const updateData = {
            status,
            admin_note: admin_note || '',
            updated_at: admin.firestore.FieldValue.serverTimestamp()
        };

        if (status === 'approved' && points_earned) {
            const pointsToAdd = Number(points_earned);
            updateData.points_earned = pointsToAdd;

            const userRef = db.collection('users').doc(actionData.user_id);
            const userDoc = await userRef.get();

            if (userDoc.exists) {
                const userData = userDoc.data();
                const newTotal = (userData.points || 0) + pointsToAdd;
                const newMonthly = (userData.monthly_points || 0) + pointsToAdd;

                await userRef.update({
                    points: newTotal,
                    monthly_points: newMonthly
                });

                console.log(`✅ Points added: +${pointsToAdd} → Total: ${newTotal}`);
            }
        }

        if (status === 'rejected' && rejection_reason) {
            updateData.rejection_reason = rejection_reason;
            updateData.points_earned = 0;
        }

        await actionRef.update(updateData);

        console.log('✅ Action verified:', id, status);

        return res.json({
            success: true,
            message: `Aksi berhasil di${status === 'approved' ? 'setujui' : 'tolak'}`
        });

    } catch (err) {
        console.error('❌ Verify Action Error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.getLeaderboard = async (req, res) => {
    try {
        // Try dengan orderBy dulu (admin leaderboard)
        try {
            const snap = await db.collection('users')
                .where('role', '==', 'user')
                .orderBy('monthly_points', 'desc')
                .limit(10)
                .get();

            const data = [];
            snap.forEach(doc => {
                const d = doc.data();
                data.push({
                    id: doc.id,
                    name: d.name || '',
                    points: d.monthly_points || 0,
                    medal: d.medal || '',
                    level: d.level || 'Eco-Newbie'
                });
            });

            return res.json({ period: 'April 2026', data });
        } catch (indexErr) {
            // Fallback: Get semua dan sort di memory
            console.log('📌 Fallback to memory sort for admin leaderboard');
            const snap = await db.collection('users')
                .where('role', '==', 'user')
                .get();

            const data = [];
            snap.forEach(doc => {
                const d = doc.data();
                data.push({
                    id: doc.id,
                    name: d.name || '',
                    points: d.monthly_points || 0,
                    medal: d.medal || '',
                    level: d.level || 'Eco-Newbie'
                });
            });

            // Sort dan ambil top 10
            data.sort((a, b) => b.points - a.points);
            return res.json({ period: 'April 2026', data: data.slice(0, 10) });
        }

    } catch (err) {
        console.error('❌ Leaderboard Error:', err);
        return res.status(500).json({ success: false, message: 'Error' });
    }
};

/**
 * Delete User - Admin bisa hapus user duplikat/inactive
 * Akan menghapus dari Firestore dan juga dari Firebase Auth
 * Semua aksi user juga akan dihapus
 */
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ success: false, message: 'User ID wajib diisi' });
        }

        // Validasi user exists
        const userDoc = await db.collection('users').doc(id).get();
        if (!userDoc.exists) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        }

        const userName = userDoc.data().name;

        // Delete semua actions user
        const actSnap = await db.collection('actions')
            .where('user_id', '==', id)
            .get();

        for (const doc of actSnap.docs) {
            await doc.ref.delete();
        }
        console.log(`✅ Deleted ${actSnap.size} actions for user ${id}`);

        // Delete semua event registrations
        const regSnap = await db.collection('event_registrations')
            .where('user_id', '==', id)
            .get();

        for (const doc of regSnap.docs) {
            await doc.ref.delete();
        }
        console.log(`✅ Deleted ${regSnap.size} registrations for user ${id}`);

        // Delete user dari Firestore
        await db.collection('users').doc(id).delete();
        console.log(`✅ Deleted user from Firestore: ${id}`);

        // Try delete dari Firebase Auth (optional - mungkin akan error jika user tidak authenticated)
        try {
            await admin.auth().deleteUser(id);
            console.log(`✅ Deleted user from Firebase Auth: ${id}`);
        } catch (authErr) {
            console.log(`⚠️ Could not delete from Firebase Auth (user might already be deleted): ${authErr.message}`);
        }

        return res.json({
            success: true,
            message: `User "${userName}" berhasil dihapus`
        });

    } catch (err) {
        console.error('❌ Delete User Error:', err);
        return res.status(500).json({ success: false, message: 'Error: ' + err.message });
    }
};