// backend/config/db.js
const admin = require('firebase-admin');

if (!admin.apps.length) {
    try {
        const serviceAccount = require('../serviceAccountKey.json');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        const project = serviceAccount.project_id;
        console.log('✅ Firebase Admin SDK initialized');
        console.log(`📁 Project: ${project}`);
    } catch (error) {
        console.error('❌ Firebase Error:', error.message);
        console.error('⚠️ serviceAccountKey.json tidak ada di backend folder!');
        console.error('📍 Tempat yang benar: backend/serviceAccountKey.json');
        process.exit(1);
    }
}

const db = admin.firestore();
module.exports = db;