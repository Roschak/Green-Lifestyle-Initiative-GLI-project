// backend/config/db.js
const admin = require('firebase-admin');

let db = null;
let firebaseReady = false;

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
            console.log('📦 serviceAccountKey.json not found, trying environment variables');
            console.log(`📝 Checking FIREBASE_PROJECT_ID: ${process.env.FIREBASE_PROJECT_ID ? 'SET' : 'NOT SET'}`);

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
            console.log('✅ Firebase credential created from environment variables');
        }

        admin.initializeApp({
            credential: credential,
            ignoreUndefinedProperties: true
        });

        const project = process.env.FIREBASE_PROJECT_ID || 'unknown';
        console.log('✅ Firebase Admin SDK initialized');
        console.log(`📁 Project: ${project}`);
        
        db = admin.firestore();
        firebaseReady = true;
    } catch (error) {
        console.error('❌ Firebase Initialization Error:', error.message);
        console.error('⚠️ Firebase is NOT ready. App will run but database queries will fail');
        console.error('⚠️ To fix, either:');
        console.error('  1. Add serviceAccountKey.json to backend folder (localhost), OR');
        console.error('  2. Set environment variables in Vercel:');
        console.error('     - FIREBASE_PROJECT_ID');
        console.error('     - FIREBASE_PRIVATE_KEY_ID');
        console.error('     - FIREBASE_PRIVATE_KEY');
        console.error('     - FIREBASE_CLIENT_EMAIL');
        console.error('     - FIREBASE_CLIENT_ID');
        console.error('     - FIREBASE_CLIENT_X509_CERT_URL');
        firebaseReady = false;
        db = null;
        // Don't exit - let app continue to serve at least health checks
    }
}

module.exports = db;
module.exports.firebaseReady = firebaseReady;