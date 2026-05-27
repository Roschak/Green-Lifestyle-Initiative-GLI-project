// backend/controllers/userController.js
// Handles user-related operations: action reporting, stats retrieval, profile data
const db = require('../config/db');
const admin = require('firebase-admin');
const path = require('path');
const { uploadToFirebaseStorage } = require('../config/firebaseStorage');
// TODO: Firebase Storage upload to be implemented later

const normalizeActionImageUrl = (val) => {
    if (!val) return val;

    if (typeof val === 'string') {
        if (val.startsWith('http://') || val.startsWith('https://')) {
            return val;
        }

        const normalizedPath = val.replace(/\\/g, '/');

        // Legacy Cloudinary path format stored in DB: /uploads/gli_actions/<public_id>
        if (normalizedPath.startsWith('/uploads/gli_actions/')) {
            const publicId = normalizedPath.split('/uploads/')[1] || '';
            const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dmgypsno6';
            return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId.replace(/^\/+/, '')}`;
        }

        if (normalizedPath.startsWith('/uploads/')) {
            return `/${path.posix.normalize(normalizedPath).replace(/^\/+/, '')}`;
        }

        return normalizedPath;
    }

    if (typeof val === 'object') {
        if (val.secure_url) return val.secure_url;
        if (val.url && /^https?:\/\//i.test(val.url)) return val.url;
        if (val.path && /^https?:\/\//i.test(val.path)) return val.path;
        if (val.public_id) {
            const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dmgypsno6';
            return `https://res.cloudinary.com/${cloudName}/image/upload/${val.public_id}`;
        }
    }

    return val;
};

/**
 * Create Action - Endpoint untuk user submit aksi hijau baru
 * File upload optional (foto atau gambar pendukung)
 * Set status = 'pending' menunggu admin verifikasi
 * points_earned dimulai dari 0, diisi oleh admin setelah approve
 */
exports.createAction = async (req, res) => {
    try {
        console.log('🎬 [createAction] START');

        const { user_id, action_name, description, location } = req.body;
        let imageUrl = null;

        // Validasi required fields
        if (!user_id || !action_name) {
            console.error('❌ Missing required fields');
            return res.status(400).json({ success: false, message: 'User ID dan nama aksi wajib' });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Foto aksi wajib diupload. Jika upload gagal, cek koneksi atau konfigurasi Cloudinary.'
            });
        }

        // Get image URL from upload result (Cloudinary URL or local /uploads path)
        if (req.file) {
            if (req.file.buffer) {
                try {
                    const fileName = req.file.originalname || `action-${Date.now()}.jpg`;
                    imageUrl = await uploadToFirebaseStorage(req.file.buffer, fileName, 'actions');
                } catch (uploadErr) {
                    console.error('❌ [createAction] Firebase upload failed:', uploadErr.message);
                }
            }

            if (!imageUrl && req.file.path && /^https?:\/\//i.test(req.file.path)) {
                imageUrl = req.file.path;
            } else if (!imageUrl && req.file.filename) {
                imageUrl = `/uploads/${req.file.filename}`;
            } else if (!imageUrl && req.file.path) {
                imageUrl = `/${String(req.file.path).replace(/\\/g, '/').replace(/^\/+/, '')}`;
            }

            if (imageUrl && !/^https?:\/\//i.test(imageUrl)) {
                imageUrl = `/${path.posix.normalize(imageUrl).replace(/^\/+/, '')}`;
            }

            imageUrl = normalizeActionImageUrl(imageUrl);

            console.log('✅ Image uploaded:', imageUrl || '(no usable path)');
        } else {
            console.warn('⚠️ No image file uploaded');
        }

        // Build data object - only include defined values
        const actionData = {
            user_id,
            action_name,
            description: description || '',
            location: location || '',
            status: 'pending',  // Belum approved admin
            points_earned: 0,   // Akan diisi admin
            admin_note: '',
            rejection_reason: '',  // Jika di-reject
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp()
        };

        // Add image URL if uploaded
        if (imageUrl) {
            actionData.img = imageUrl;
            actionData.imageUrl = imageUrl;
        }

        // Simpan action dengan status pending untuk admin review
        const docRef = await db.collection('actions').add(actionData);

        console.log('✅ [createAction] SUCCESS - Action created:', docRef.id, { img: imageUrl ? 'YES' : 'NO' });

        return res.status(201).json({
            success: true,
            message: 'Aksi berhasil dilaporkan!',
            actionId: docRef.id,
            imageUrl: imageUrl || null
        });

    } catch (err) {
        console.error('❌ [createAction] FAILED - Error:', err.message);
        console.error('❌ [createAction] Error stack:', err.stack);
        console.error('❌ [createAction] Full error:', err);
        return res.status(500).json({
            success: false,
            message: 'Gagal membuat aksi',
            error: err.message
        });
    }
};

/**
 * Get User Actions - Ambil riwayat aksi user (approved/pending/rejected)
 * Sort by created_at descending (terbaru duluan)
 * Convert Firestore Timestamps ke ISO string untuk JSON response
 * Sort di memory supaya tidak butuh composite index Firestore
 */
exports.getUserActions = async (req, res) => {
    try {
        const userId = req.params.id;

        // Query tanpa orderBy agar tidak tergantung composite index
        const snapshot = await db.collection('actions')
            .where('user_id', '==', userId)
            .get();

        const actions = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            // Firestore Timestamp object harus convert ke ISO string
            if (data.created_at?.toDate) data.created_at = data.created_at.toDate().toISOString();
            if (data.updated_at?.toDate) data.updated_at = data.updated_at.toDate().toISOString();

            // Normalize any action image fields to ensure frontend can display images reliably
            const rawImage = data.img || data.imageUrl || data.image || data.photo || data.photo_url || data.proof_img;
            const normalizedImage = normalizeActionImageUrl(rawImage);
            if (normalizedImage) {
                data.img = normalizedImage;
                data.imageUrl = normalizedImage;
            }

            actions.push({ id: doc.id, ...data });
        });

        // Sort terbaru dulu berdasarkan created_at
        actions.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

        console.log(`✅ getUserActions for ${userId}: ${actions.length} actions`);
        return res.json(actions);

    } catch (err) {
        console.error('❌ Get User Actions Error:', err);
        // Always return array even on error (graceful degradation)
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
            totalPoints: user.monthly_points || 0,  // Total poin dari semua aksi approved bulan ini
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
 * ✅ FIXED: Ranking hanya untuk user dengan actions/points > 0
 * User tanpa aksi tidak dapat ranking (ranking = null)
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

        // ✅ FIXED: Ranking hanya jika user punya actions atau points > 0
        let ranking = null;
        if (actions.length > 0 || (user.monthly_points || 0) > 0) {
            try {
                const rankSnap = await db.collection('users')
                    .where('role', '==', 'user')
                    .where('monthly_points', '>', user.monthly_points || 0)
                    .get();
                ranking = rankSnap.size + 1;
            } catch (indexErr) {
                // Fallback tanpa index
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
        }

        // Build seasonal history from monthly_history collection (if available)
        const history = [];
        try {
            const histSnap = await db.collection('monthly_history').orderBy('year', 'desc').get();
            histSnap.forEach(doc => {
                const data = doc.data();
                const userRecord = data.user_final_rankings && data.user_final_rankings[id];
                if (userRecord) {
                    history.push({
                        period: data.period,
                        snapshotted_at: data.snapshotted_at && data.snapshotted_at.toDate ? data.snapshotted_at.toDate().toISOString() : null,
                        rank: userRecord.rank || null,
                        points: userRecord.points || 0,
                        made_leaderboard: Boolean(userRecord.made_leaderboard),
                        medal: userRecord.medal || null
                    });
                }
            });
        } catch (histErr) {
            // If monthly_history doesn't exist or query fails, return empty history
            console.warn('⚠️ Could not load monthly_history:', histErr.message);
        }

        // Compute total actions and derive medals without mutating DB
        const totalActions = actions.length;

        // Start with any stored medals on user record (comma separated)
        const storedMedalsRaw = (user.medal || '').trim();
        const storedMedals = storedMedalsRaw ? storedMedalsRaw.split(',').map(m => m.trim()).filter(Boolean) : [];

        // Computed medals: ranking-based medal (top 1-20)
        const computedMedals = [];

        if (ranking && Number.isFinite(ranking) && ranking <= 20) {
            // Users inside top-20 get a ranking medal
            computedMedals.push('PIONIR HIJAU');
        }

        // Merge stored + computed medals, unique preserve order
        const medalSet = [];
        for (const m of [...storedMedals, ...computedMedals]) {
            if (!m) continue;
            const norm = m.trim();
            if (!medalSet.includes(norm)) medalSet.push(norm);
        }

        // Persist medals to DB if changed (safe, non-destructive)
        try {
            const newMedalString = medalSet.join(', ');
            const currentMedalString = (user.medal || '').trim();
            if (newMedalString && newMedalString !== currentMedalString) {
                await db.collection('users').doc(id).update({
                    medal: newMedalString,
                    updated_at: admin.firestore.FieldValue.serverTimestamp()
                });
                console.log(`✅ Persisted medals for user ${id}: ${newMedalString}`);
            }
        } catch (persistErr) {
            console.warn('⚠️ Could not persist medals to DB:', persistErr.message);
        }

        return res.json({
            id,
            name: user.name || '',
            email: user.email || '',
            points: user.points || 0,
            monthlyPoints: user.monthly_points || 0,
            level: user.level || 'Eco-Newbie',
            history, // seasonal history of points/ranks
            ranking: ranking,  // null jika tidak ada actions
            totalActions,
            approved,
            rejected,
            pending,
            medals: medalSet // array of medal names for frontend display
        });

    } catch (err) {
        console.error('❌ Get User Profile Error:', err);
        return res.status(500).json({ message: 'Error' });
    }
};

/**
 * Get Public Leaderboard - Peringkat untuk user (tidak perlu admin)
 * Top 10 users berdasarkan monthly_points
 * ✅ HANYA tampilkan users dengan points > 0 (tidak termasuk no-action users)
 * Digunakan untuk halaman Peringkat user
 */
exports.getPublicLeaderboard = async (req, res) => {
    try {
        // NOTE: Monthly reset automation removed during rollback.
        // Compute current period locally for display only.
        const now = new Date();
        const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
        const currentPeriod = {
            month: months[now.getMonth()],
            monthNum: now.getMonth() + 1,
            year: now.getFullYear(),
            period: `${months[now.getMonth()]} ${now.getFullYear()}`
        };

        console.log('📌 Fetching leaderboard for:', currentPeriod.period);

        const snap = await db.collection('users')
            .where('role', '==', 'user')
            .get();

        const users = [];

        // Get all user-approved action counts for total_actions field
        const actionsSnap = await db.collection('actions')
            .where('status', '==', 'approved')
            .get();

        const actionCounts = {};
        actionsSnap.forEach(doc => {
            const userId = doc.data().user_id;
            actionCounts[userId] = (actionCounts[userId] || 0) + 1;
        });

        snap.forEach(doc => {
            const points = doc.data().monthly_points || 0;
            const userId = doc.id;
            // ✅ FILTER: Hanya include users dengan points > 0
            if (points > 0) {
                users.push({
                    id: userId,
                    name: doc.data().name || 'User',
                    points: points,
                    medal: doc.data().medal || '',
                    level: doc.data().level || 'Eco-Newbie',
                    avatar: doc.data().avatar || null,
                    total_actions: actionCounts[userId] || 0
                });
            }
        });

        // Sort by points descending dan ambil top 10
        users.sort((a, b) => b.points - a.points);
        const data = users.slice(0, 10).map((u, i) => ({
            rank: i + 1,
            ...u
        }));

        return res.json({
            success: true,
            period: currentPeriod.period,
            current_period: currentPeriod,
            data
        });

    } catch (err) {
        console.error('❌ Public Leaderboard Error:', err);
        return res.status(500).json({ success: false, message: 'Error fetching leaderboard' });
    }
};

/**
 * Heartbeat - Update last_activity untuk tracking user aktif
 * Frontend call setiap 5 menit, update last_activity timestamp
 * Admin monitoring: Jika last_activity > 10 menit lalu, set status = offline
 */
exports.heartbeat = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'User tidak teridentifikasi' });
        }

        // Update last_activity timestamp
        await db.collection('users').doc(userId).update({
            last_activity: admin.firestore.FieldValue.serverTimestamp(),
            status: 'online'  // Set ke online setiap ada heartbeat
        });

        console.log(`✅ Heartbeat from user ${userId}`);

        return res.json({
            success: true,
            message: 'Heartbeat received',
            timestamp: new Date().toISOString()
        });

    } catch (err) {
        console.error('❌ Heartbeat Error:', err);
        return res.status(500).json({ success: false, message: 'Error' });
    }
};

/**
 * Award Medal to User - Helper function untuk menambah medali ke user
 * ✅ Prevents duplicate medals
 * ✅ Records medal in user.medal field (comma-separated)
 * Used by: action approval, event completion
 */
const awardMedalToUser = async (userId, medalName) => {
    if (!userId || !medalName) {
        console.warn('⚠️ awardMedalToUser: Missing userId or medalName');
        return false;
    }

    try {
        const userDoc = await db.collection('users').doc(userId).get();

        if (!userDoc.exists()) {
            console.error('❌ User not found:', userId);
            return false;
        }

        const currentMedals = userDoc.data().medal || '';
        const medalList = currentMedals
            .split(', ')
            .filter(m => m.trim());
        const updatedMedals = medalList.includes(medalName)
            ? medalList.join(', ')
            : [...medalList, medalName].join(', ');

        // Update Firestore
        await db.collection('users').doc(userId).update({
            medal: updatedMedals,
            updated_at: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`✅ Medal awarded to user ${userId}: ${medalName}`);
        return true;

    } catch (err) {
        console.error('❌ awardMedalToUser error:', err);
        return false;
    }
};

/**
 * Update User Profile - Endpoint untuk edit nama, avatar
 * PUT /user/profile/{id}
 */
exports.updateUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, avatar } = req.body;

        if (!id) {
            return res.status(400).json({ success: false, message: 'User ID diperlukan' });
        }

        const updateData = {};

        // Validate & update name
        if (name) {
            if (name.trim().length < 3) {
                return res.status(400).json({ success: false, message: 'Nama minimal 3 karakter' });
            }
            updateData.name = name.trim();
        }

        // Validate & update avatar
        if (avatar) {
            updateData.avatar = avatar; // Should be Cloudinary URL
        }

        updateData.updated_at = admin.firestore.FieldValue.serverTimestamp();

        // Update Firestore
        await db.collection('users').doc(id).update(updateData);

        console.log(`✅ Profile updated for user ${id}:`, Object.keys(updateData));

        return res.json({
            success: true,
            message: 'Profil berhasil diupdate',
            data: updateData
        });

    } catch (err) {
        console.error('❌ Update Profile Error:', err);
        return res.status(500).json({ success: false, message: 'Gagal update profil: ' + err.message });
    }
};

/**
 * Export awardMedalToUser untuk digunakan di controller lain
 */
exports.awardMedalToUser = awardMedalToUser;

/**
 * Upload Avatar - Handle profile photo upload ke Cloudinary
 * POST /user/profile/{id}/avatar
 */
exports.uploadAvatar = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ success: false, message: 'User ID diperlukan' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Foto profile diperlukan' });
        }

        const avatarUrl = req.file.path; // Cloudinary URL from multer

        // Update user avatar in Firestore
        await db.collection('users').doc(id).update({
            avatar: avatarUrl,
            updated_at: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`✅ Avatar uploaded for user ${id}: ${avatarUrl}`);

        return res.json({
            success: true,
            message: 'Foto profile berhasil diupload',
            avatar: avatarUrl
        });

    } catch (err) {
        console.error('❌ Upload Avatar Error:', err);
        return res.status(500).json({ success: false, message: 'Gagal upload foto: ' + err.message });
    }
};