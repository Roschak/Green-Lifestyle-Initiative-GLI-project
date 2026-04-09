// backend/config/db.js
const admin = require('firebase-admin');

if (!admin.apps.length) {
    try {
        // Try to load from file first (localhost development)
        let credential;
        try {
            const serviceAccount = require('../serviceAccountKey.json');
            credential = admin.credential.cert(serviceAccount);
            console.log('✅ Using serviceAccountKey.json');
        } catch (fileError) {
            // Fall back to environment variables (Vercel/production)
            console.log('📦 serviceAccountKey.json not found, using environment variables');

            const serviceAccount = {
                type: "service_account",
                project_id: process.env.FIREBASE_PROJECT_ID,
                private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
                private_key: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
                client_email: process.env.FIREBASE_CLIENT_EMAIL,
                client_id: process.env.FIREBASE_CLIENT_ID,
                auth_uri: "https://accounts.google.com/o/oauth2/auth",
                token_uri: "https://oauth2.googleapis.com/token",
                auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
                client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
            };

            if (!serviceAccount.project_id) {
                throw new Error('FIREBASE_PROJECT_ID not set in environment variables');
            }

            credential = admin.credential.cert(serviceAccount);
            console.log('✅ Using Firebase credentials from environment variables');
        }

        admin.initializeApp({
            credential: credential
        });

        const project = process.env.FIREBASE_PROJECT_ID || 'unknown';
        console.log('✅ Firebase Admin SDK initialized');
        console.log(`📁 Project: ${project}`);
    } catch (error) {
        console.error('❌ Firebase Error:', error.message);
        console.error('⚠️ Make sure either:');
        console.error('  1. serviceAccountKey.json exists in backend folder (localhost), OR');
        console.error('  2. Environment variables are set (Vercel/production)');
        process.exit(1);
    }
}

const db = admin.firestore();
module.exports = db;