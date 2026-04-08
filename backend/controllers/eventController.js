// backend/controllers/eventController.js
const db = require('../config/db');
const admin = require('firebase-admin');

exports.createEvent = async (req, res) => {
    try {
        const { 
            title, description, location, wa_link, medal_name,
            registration_start, registration_end, event_start, event_end,
            host_id, host_role, thumbnail_type, thumbnail_text, thumbnail_color
        } = req.body;

        let thumbnailUrl = null;

        if (req.file) {
            thumbnailUrl = req.file.path;
            console.log('✅ Thumbnail uploaded:', thumbnailUrl);
        }

        const docRef = await db.collection('events').add({
            title: title || '',
            description: description || '',
            location: location || '',
            wa_link: wa_link || '',
            medal_name: medal_name || 'Medali Sosialisasi',
            thumbnail: thumbnailUrl,
            thumbnail_type: thumbnail_type || 'image',
            thumbnail_text: thumbnail_text || '',
            thumbnail_color: thumbnail_color || '#22c55e',
            host_id: host_id || '',
            host_role: host_role || 'admin',
            status: 'roundown',
            registration_start: new Date(registration_start),
            registration_end: new Date(registration_end),
            event_start: new Date(event_start),
            event_end: new Date(event_end),
            created_at: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log('✅ Event created:', docRef.id);

        return res.status(201).json({ 
            success: true, 
            message: 'Event berhasil dibuat!', 
            eventId: docRef.id 
        });

    } catch (err) {
        console.error('❌ Create Event Error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.getAllEvents = async (req, res) => {
    try {
        const snap = await db.collection('events').orderBy('created_at', 'desc').get();
        const events = [];

        snap.forEach(doc => {
            events.push({ id: doc.id, ...doc.data() });
        });

        return res.json(events);

    } catch (err) {
        console.error('❌ Get All Events Error:', err);
        return res.status(500).json({ success: false, message: 'Error' });
    }
};

exports.registerToEvent = async (req, res) => {
    try {
        const { event_id, user_id, name, email, phone, is_gli_member } = req.body;

        const existing = await db.collection('event_registrations')
            .where('event_id', '==', event_id)
            .where('email', '==', email)
            .limit(1)
            .get();

        if (!existing.empty) {
            return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
        }

        const docRef = await db.collection('event_registrations').add({
            event_id: event_id || '',
            user_id: user_id || '',
            name: name || '',
            email: email || '',
            phone: phone || '',
            is_gli_member: is_gli_member ? 1 : 0,
            proof_img: null,
            proof_status: 'pending',
            medal_awarded: false,
            registered_at: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log('✅ Registration created:', docRef.id);

        return res.status(201).json({ 
            success: true, 
            message: 'Berhasil mendaftar event!', 
            registrationId: docRef.id 
        });

    } catch (err) {
        console.error('❌ Register Event Error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.uploadProof = async (req, res) => {
    try {
        const { registration_id } = req.body;
        let proofUrl = null;

        if (req.file) {
            proofUrl = req.file.path;
            console.log('✅ Proof uploaded:', proofUrl);
        } else {
            return res.status(400).json({ success: false, message: 'Gambar wajib diupload' });
        }

        await db.collection('event_registrations').doc(registration_id).update({
            proof_img: proofUrl,
            proof_status: 'pending'
        });

        console.log('✅ Proof uploaded for registration:', registration_id);

        return res.json({ 
            success: true, 
            message: 'Bukti kehadiran berhasil diupload!' 
        });

    } catch (err) {
        console.error('❌ Upload Proof Error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.getEventRegistrations = async (req, res) => {
    try {
        const { event_id } = req.params;

        const snap = await db.collection('event_registrations')
            .where('event_id', '==', event_id)
            .get();

        const registrations = [];
        snap.forEach(doc => {
            registrations.push({ id: doc.id, ...doc.data() });
        });

        return res.json(registrations);

    } catch (err) {
        console.error('❌ Get Event Registrations Error:', err);
        return res.status(500).json({ success: false, message: 'Error' });
    }
};