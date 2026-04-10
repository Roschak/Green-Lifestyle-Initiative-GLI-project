// backend/controllers/eventController.js - CRITICAL FIXES

// ============= ISSUE #1: Event Creation Approval System =============
// NEW FEATURE: User creates event → Must be approved by admin before showing

exports.createEvent = async (req, res) => {
    try {
        const {
            title, description, location, wa_link, medal_name,
            registration_start, registration_end, event_start, event_end,
            thumbnail_type, thumbnail_text, thumbnail_color
        } = req.body;

        if (!title || !description || !location) {
            return res.status(400).json({
                success: false,
                message: 'Judul, deskripsi, dan lokasi wajib diisi'
            });
        }

        // Validate dates
        const regStart = new Date(registration_start);
        const regEnd = new Date(registration_end);
        const evStart = new Date(event_start);
        const evEnd = new Date(event_end);

        if (isNaN(regStart) || isNaN(regEnd) || isNaN(evStart) || isNaN(evEnd)) {
            return res.status(400).json({
                success: false,
                message: 'Format tanggal tidak valid'
            });
        }

        if (regStart >= regEnd) {
            return res.status(400).json({
                success: false,
                message: 'Waktu registrasi tidak valid'
            });
        }

        let thumbnailUrl = null;
        if (req.file) {
            thumbnailUrl = req.file.path;
        }

        const host_id = req.user?.id;
        const host_role = req.user?.role || 'user';

        if (!host_id) {
            return res.status(401).json({
                success: false,
                message: 'User tidak teridentifikasi'
            });
        }

        const docRef = await db.collection('events').add({
            title: title.trim(),
            description: description.trim(),
            location: location.trim(),
            wa_link: wa_link || '',
            medal_name: medal_name || 'Medali Sosialisasi',
            thumbnail: thumbnailUrl,
            thumbnail_type: thumbnail_type || 'image',
            thumbnail_text: thumbnail_text || '',
            thumbnail_color: thumbnail_color || '#22c55e',
            host_id: host_id,
            host_role: host_role,

            // ✅ NEW: APPROVAL STATUS
            approval_status: 'pending',  // pending | approved | rejected
            approval_date: null,
            admin_notes: '',

            status: 'roundown',
            registration_start: regStart,
            registration_end: regEnd,
            event_start: evStart,
            event_end: evEnd,
            created_at: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log('📝 Event created (pending approval):', docRef.id);

        return res.status(201).json({
            success: true,
            message: 'Event berhasil dibuat! Menunggu persetujuan admin.',
            eventId: docRef.id,
            approvalStatus: 'pending'
        });

    } catch (err) {
        console.error('❌ Create Event Error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Gagal membuat event: ' + err.message
        });
    }
};

// ============= NEW: Admin approve/reject events =============
exports.approveEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { approval_status, admin_notes } = req.body;

        if (!['approved', 'rejected'].includes(approval_status)) {
            return res.status(400).json({
                success: false,
                message: 'Status approval tidak valid'
            });
        }

        const eventRef = db.collection('events').doc(eventId);
        const eventDoc = await eventRef.get();

        if (!eventDoc.exists) {
            return res.status(404).json({
                success: false,
                message: 'Event tidak ditemukan'
            });
        }

        await eventRef.update({
            approval_status,
            admin_notes: admin_notes || '',
            approval_date: admin.firestore.FieldValue.serverTimestamp(),
            status: approval_status === 'approved' ? 'roundown' : 'rejected'
        });

        console.log(`✅ Event ${approval_status}:`, eventId);

        return res.json({
            success: true,
            message: `Event berhasil di${approval_status === 'approved' ? 'setujui' : 'tolak'}`
        });

    } catch (err) {
        console.error('❌ Approve Event Error:', err.message);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// ============= MODIFIED: getAllEvents - Only show approved events =============
exports.getAllEvents = async (req, res) => {
    try {
        // Only show approved events to users
        const snap = await db.collection('events')
            .where('approval_status', '==', 'approved')
            .orderBy('created_at', 'desc')
            .get();

        const events = [];

        snap.forEach(doc => {
            const data = doc.data();
            // Convert timestamps
            if (data.created_at?.toDate) data.created_at = data.created_at.toDate().toISOString();
            if (data.registration_start?.toDate) data.registration_start = data.registration_start.toDate().toISOString();
            if (data.registration_end?.toDate) data.registration_end = data.registration_end.toDate().toISOString();
            if (data.event_start?.toDate) data.event_start = data.event_start.toDate().toISOString();
            if (data.event_end?.toDate) data.event_end = data.event_end.toDate().toISOString();
            events.push({ id: doc.id, ...data });
        });

        return res.json(events);

    } catch (err) {
        console.error('❌ Get All Events Error:', err.message);

        // Fallback without orderBy
        try {
            const snapshot = await db.collection('events')
                .where('approval_status', '==', 'approved')
                .get();

            const events = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.created_at?.toDate) data.created_at = data.created_at.toDate().toISOString();
                if (data.registration_start?.toDate) data.registration_start = data.registration_start.toDate().toISOString();
                if (data.registration_end?.toDate) data.registration_end = data.registration_end.toDate().toISOString();
                if (data.event_start?.toDate) data.event_start = data.event_start.toDate().toISOString();
                if (data.event_end?.toDate) data.event_end = data.event_end.toDate().toISOString();
                events.push({ id: doc.id, ...data });
            });

            events.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            return res.json(events);
        } catch (fallbackErr) {
            console.error('❌ Fallback error:', fallbackErr.message);
            return res.json([]);
        }
    }
};

// ============= ISSUE #2: Auto-delete old photos (2+ days after completion) =============
exports.cleanupOldPhotos = async (req, res) => {
    try {
        const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

        // Find approved actions older than 2 days
        const snapshot = await db.collection('actions')
            .where('status', '==', 'approved')
            .where('updated_at', '<', twoDaysAgo)
            .get();

        let deletedCount = 0;

        for (const doc of snapshot.docs) {
            const action = doc.data();

            if (action.img) {
                try {
                    // Delete from Cloudinary (extract public_id from URL)
                    const publicId = extractPublicIdFromUrl(action.img);
                    if (publicId) {
                        await deleteFromCloudinary(publicId);
                        console.log('🗑️ Deleted from Cloudinary:', publicId);
                    }

                    // Update Firestore - keep metadata, remove photo URL
                    await doc.ref.update({
                        img: null,
                        photo_deleted_at: admin.firestore.FieldValue.serverTimestamp(),
                        photo_deleted_reason: 'auto_cleanup_2_days'
                    });

                    deletedCount++;
                } catch (deleteErr) {
                    console.error('⚠️ Error deleting photo:', deleteErr.message);
                }
            }
        }

        console.log(`✅ Cleanup complete: ${deletedCount} photos deleted`);

        return res.json({
            success: true,
            deleted: deletedCount,
            message: `${deletedCount} foto lama berhasil dihapus`
        });

    } catch (err) {
        console.error('❌ Cleanup Error:', err.message);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// Helper: Extract Cloudinary public ID from URL
function extractPublicIdFromUrl(url) {
    try {
        const parts = url.split('/');
        const filename = parts[parts.length - 1];
        return filename.split('.')[0];
    } catch (err) {
        console.error('Error extracting public ID:', err);
        return null;
    }
}

// Helper: Delete from Cloudinary
async function deleteFromCloudinary(publicId) {
    try {
        const cloudinary = require('cloudinary').v2;

        if (!cloudinary.config().cloud_name) {
            console.log('⚠️ Cloudinary not configured, skipping deletion');
            return;
        }

        await cloudinary.uploader.destroy(publicId);
    } catch (err) {
        console.error('Error deleting from Cloudinary:', err);
        throw err;
    }
}
