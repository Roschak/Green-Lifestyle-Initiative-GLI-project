// backend/controllers/adminController.js - ISSUE #3: Fix point system showing 0

// ============= FIXED: verifyAction - Ensure points_earned not 0 =============
exports.verifyAction = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, points_earned, admin_note, rejection_reason } = req.body;

        // Validate inputs
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status tidak valid'
            });
        }

        if (status === 'approved' && (!points_earned || points_earned <= 0)) {
            return res.status(400).json({
                success: false,
                message: 'Points harus lebih dari 0'
            });
        }

        const actionRef = db.collection('actions').doc(id);
        const actionDoc = await actionRef.get();

        if (!actionDoc.exists) {
            return res.status(404).json({
                success: false,
                message: 'Aksi tidak ditemukan'
            });
        }

        const actionData = actionDoc.data();
        const pointsToAdd = Number(points_earned) || 0;

        // Prepare update data
        const updateData = {
            status,
            admin_note: admin_note || '',
            updated_at: admin.firestore.FieldValue.serverTimestamp()
        };

        // ✅ FIX: If approved, MUST add points (not 0)
        if (status === 'approved') {
            if (pointsToAdd <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Nilai poin harus lebih dari 0'
                });
            }

            updateData.points_earned = pointsToAdd;

            // Update user points
            const userRef = db.collection('users').doc(actionData.user_id);
            const userDoc = await userRef.get();

            if (!userDoc.exists) {
                return res.status(404).json({
                    success: false,
                    message: 'User tidak ditemukan'
                });
            }

            const userData = userDoc.data();
            const newTotal = (userData.points || 0) + pointsToAdd;
            const newMonthly = (userData.monthly_points || 0) + pointsToAdd;

            // ✅ Ensure points never stay at 0
            if (newTotal <= 0 || newMonthly <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Total poin tidak boleh 0 atau negatif'
                });
            }

            await userRef.update({
                points: newTotal,
                monthly_points: newMonthly
            });

            console.log(`✅ Points added to user ${actionData.user_id}: +${pointsToAdd} (total: ${newTotal})`);
        }

        // If rejected, add rejection reason
        if (status === 'rejected') {
            updateData.rejection_reason = rejection_reason || 'Tidak sesuai dengan kriteria';
            updateData.points_earned = 0;
        }

        // Update action
        await actionRef.update(updateData);

        console.log('✅ Action verified:', id, `status=${status}, points=${pointsToAdd}`);

        return res.json({
            success: true,
            message: `Aksi berhasil di${status === 'approved' ? 'setujui' : 'tolak'}`,
            pointsEarned: pointsToAdd
        });

    } catch (err) {
        console.error('❌ Verify Action Error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Gagal memverifikasi aksi: ' + err.message
        });
    }
};

// ============= NEW: Get pending event approvals (for admin) =============
exports.getPendingEventApprovals = async (req, res) => {
    try {
        const snap = await db.collection('events')
            .where('approval_status', '==', 'pending')
            .orderBy('created_at', 'desc')
            .get();

        const events = [];

        for (const doc of snap.docs) {
            const data = doc.data();
            const hostDoc = await db.collection('users').doc(data.host_id).get();

            events.push({
                id: doc.id,
                title: data.title,
                description: data.description,
                location: data.location,
                host_name: hostDoc.exists ? hostDoc.data().name : 'Unknown',
                host_id: data.host_id,
                thumbnail: data.thumbnail,
                created_at: data.created_at?.toDate?.().toISOString() || new Date().toISOString(),
                event_start: data.event_start?.toDate?.().toISOString() || '',
                event_end: data.event_end?.toDate?.().toISOString() || ''
            });
        }

        return res.json({
            success: true,
            pending_count: events.length,
            data: events
        });

    } catch (err) {
        console.error('❌ Get Pending Events Error:', err.message);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// ============= ALL OTHER FUNCTIONS WITH ERROR HANDLING =============

exports.getDashboardStats = async (req, res) => {
    try {
        const usersSnap = await db.collection('users').where('role', '==', 'user').get();
        const actSnap = await db.collection('actions').get();
        const eventSnap = await db.collection('events').where('approval_status', '==', 'approved').get();

        const actions = [];
        actSnap.forEach(doc => {
            const data = doc.data();
            if (data) actions.push(data);
        });

        const pending = actions.filter(a => a.status === 'pending').length;
        const rejected = actions.filter(a => a.status === 'rejected').length;
        const approved = actions.filter(a => a.status === 'approved').length;

        return res.json({
            success: true,
            totalUsers: usersSnap.size,
            totalActions: actSnap.size,
            totalEvents: eventSnap.size,
            pending,
            rejected,
            approved,
            onlineUsers: usersSnap.docs.filter(d => d.data()?.status === 'online').length
        });

    } catch (err) {
        console.error('❌ Dashboard Stats Error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Gagal memuat statistik'
        });
    }
};

exports.getAdminStats = async (req, res) => {
    try {
        const actSnap = await db.collection('actions').get();
        const actions = [];

        actSnap.forEach(doc => {
            const data = doc.data();
            if (data) actions.push(data);
        });

        const userSnap = await db.collection('users').where('role', '==', 'user').get();
        const onlineSnap = await db.collection('users').where('status', '==', 'online').get();

        return res.json({
            success: true,
            totalVerified: actions.filter(a => a.status !== 'pending').length,
            approved: actions.filter(a => a.status === 'approved').length,
            rejected: actions.filter(a => a.status === 'rejected').length,
            pending: actions.filter(a => a.status === 'pending').length,
            totalUsers: userSnap.size,
            onlineUsers: onlineSnap.size
        });

    } catch (err) {
        console.error('❌ Admin Stats Error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Gagal memuat statistik admin'
        });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const snap = await db.collection('users').where('role', '==', 'user').get();
        const users = [];

        snap.forEach(doc => {
            const data = doc.data();
            if (data) {
                users.push({
                    id: doc.id,
                    name: data.name || '',
                    email: data.email || '',
                    level: data.level || 'Eco-Newbie',
                    medal: data.medal || '',
                    points: Math.max(0, data.points || 0),
                    monthly_points: Math.max(0, data.monthly_points || 0),
                    status: data.status || 'offline'
                });
            }
        });

        users.sort((a, b) => (b.monthly_points || 0) - (a.monthly_points || 0));

        return res.json(users);

    } catch (err) {
        console.error('❌ Get Users Error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Gagal memuat daftar user'
        });
    }
};

exports.getUserDetail = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'User ID wajib'
            });
        }

        const userDoc = await db.collection('users').doc(id).get();
        if (!userDoc.exists) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }

        const user = userDoc.data();
        const actSnap = await db.collection('actions').where('user_id', '==', id).get();
        const actions = [];

        actSnap.forEach(doc => {
            const data = doc.data();
            if (data) actions.push(data);
        });

        const approved = actions.filter(a => a.status === 'approved').length;
        const rejected = actions.filter(a => a.status === 'rejected').length;
        const pending = actions.filter(a => a.status === 'pending').length;

        const rankSnap = await db.collection('users')
            .where('role', '==', 'user')
            .where('monthly_points', '>', user.monthly_points || 0)
            .get();

        return res.json({
            success: true,
            id,
            name: user.name || '',
            email: user.email || '',
            points: Math.max(0, user.points || 0),
            monthly_points: Math.max(0, user.monthly_points || 0),
            level: user.level || 'Eco-Newbie',
            medal: user.medal || '',
            ranking: rankSnap.size + 1,
            total_actions: actions.length,
            approved,
            rejected,
            pending
        });

    } catch (err) {
        console.error('❌ Get User Detail Error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Gagal memuat detail user'
        });
    }
};

exports.getAllActions = async (req, res) => {
    try {
        const snap = await db.collection('actions').orderBy('created_at', 'desc').get();
        const actions = [];

        for (const doc of snap.docs) {
            const data = doc.data();
            if (data) {
                const userDoc = await db.collection('users').doc(data.user_id).get();
                actions.push({
                    id: doc.id,
                    user_name: userDoc.exists ? userDoc.data().name : 'Unknown',
                    points_earned: data.points_earned || 0,
                    ...data
                });
            }
        }

        return res.json(actions);

    } catch (err) {
        console.error('❌ Get All Actions Error:', err.message);
        return res.json([]);
    }
};

exports.getLeaderboard = async (req, res) => {
    try {
        const snap = await db.collection('users')
            .where('role', '==', 'user')
            .orderBy('monthly_points', 'desc')
            .limit(10)
            .get();

        const data = [];
        snap.forEach(doc => {
            const d = doc.data();
            if (d) {
                data.push({
                    id: doc.id,
                    name: d.name || '',
                    points: Math.max(0, d.monthly_points || 0),
                    medal: d.medal || '',
                    level: d.level || 'Eco-Newbie'
                });
            }
        });

        return res.json({
            success: true,
            period: 'April 2026',
            data
        });

    } catch (err) {
        console.error('❌ Leaderboard Error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Gagal memuat leaderboard'
        });
    }
};
