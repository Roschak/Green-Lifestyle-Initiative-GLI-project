// backend/seeder.js
const db = require('./config/db');
const bcrypt = require('bcryptjs');
const admin = require('firebase-admin');

const seedDatabase = async () => {
  try {
    console.log('🌱 Seeding database...\n');

    console.log('📝 Creating users...');

    const users = [
      { email: 'admin@gli.com', name: 'Admin GLI', password: 'admin123456', role: 'admin', points: 1000, monthly: 500 },
      { email: 'budi@gli.com', name: 'Budi Santoso', password: 'user123456', role: 'user', points: 250, monthly: 100 },
      { email: 'siti@gli.com', name: 'Siti Nurhaliza', password: 'user123456', role: 'user', points: 180, monthly: 80 },
      { email: 'ahmad@gli.com', name: 'Ahmad Wijaya', password: 'user123456', role: 'user', points: 320, monthly: 150 },
      { email: 'rina@gli.com', name: 'Rina Putri', password: 'user123456', role: 'user', points: 150, monthly: 50 }
    ];

    const userIds = {};

    for (const userData of users) {
      try {
        const existing = await db.collection('users').where('email', '==', userData.email).limit(1).get();
        
        if (existing.empty) {
          const hashed = await bcrypt.hash(userData.password, 10);
          const docRef = await db.collection('users').add({
            name: userData.name,
            email: userData.email,
            password: hashed,
            role: userData.role,
            points: userData.points,
            monthly_points: userData.monthly,
            level: userData.role === 'admin' ? 'Admin' : 'Eco-Warrior',
            medal: userData.role === 'admin' ? 'PAHLAWAN ENERGI, HEMAT AIR' : '',
            status: 'offline',
            created_at: admin.firestore.FieldValue.serverTimestamp()
          });

          userIds[userData.email] = docRef.id;
          console.log(`  ✅ ${userData.name} (${docRef.id})`);
        } else {
          userIds[userData.email] = existing.docs[0].id;
          console.log(`  ℹ️  ${userData.name} sudah ada`);
        }
      } catch (err) {
        console.error(`  ❌ ${userData.email}:`, err.message);
      }
    }

    console.log('\n📝 Creating actions...');

    const actions = [
      { user_id: userIds['budi@gli.com'], name: 'Bersih Pantai', desc: 'Membersihkan sampah di pantai', loc: 'Pantai Kuta', status: 'approved', points: 50 },
      { user_id: userIds['budi@gli.com'], name: 'Menanam Pohon', desc: 'Menanam 10 pohon', loc: 'Depok', status: 'pending', points: 0 },
      { user_id: userIds['siti@gli.com'], name: 'Hemat Listrik', desc: 'Menggunakan energi terbarukan', loc: 'Jakarta', status: 'approved', points: 30 },
      { user_id: userIds['ahmad@gli.com'], name: 'Daur Ulang', desc: 'Program daur ulang sampah', loc: 'Bandung', status: 'approved', points: 40 },
      { user_id: userIds['ahmad@gli.com'], name: 'Kurangi Plastik', desc: 'Menggunakan tas ramah lingkungan', loc: 'Bandung', status: 'pending', points: 0 }
    ];

    for (const action of actions) {
      try {
        const docRef = await db.collection('actions').add({
          user_id: action.user_id,
          action_name: action.name,
          description: action.desc,
          location: action.loc,
          img: null,
          status: action.status,
          points_earned: action.points,
          admin_note: '',
          rejection_reason: '',
          created_at: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`  ✅ ${action.name}`);
      } catch (err) {
        console.error(`  ❌ ${action.name}:`, err.message);
      }
    }

    console.log('\n📝 Creating events...');

    const events = [
      { title: 'Seminar Lingkungan 2024', desc: 'Seminar tentang lingkungan', loc: 'Jakarta' },
      { title: 'Program Penanaman Pohon', desc: 'Tanam 1000 pohon bersama', loc: 'Bogor' },
      { title: 'Workshop Daur Ulang', desc: 'Belajar mengolah limbah', loc: 'Bandung' }
    ];

    const eventIds = {};

    for (const event of events) {
      try {
        const docRef = await db.collection('events').add({
          title: event.title,
          description: event.desc,
          location: event.loc,
          wa_link: 'https://wa.me/6281234567890',
          thumbnail: null,
          thumbnail_type: 'text',
          thumbnail_text: event.title,
          thumbnail_color: '#22c55e',
          host_id: userIds['admin@gli.com'],
          host_role: 'admin',
          status: 'roundown',
          medal_name: `Medal ${event.title}`,
          registration_start: new Date('2026-04-01'),
          registration_end: new Date('2026-04-15'),
          event_start: new Date('2026-04-20'),
          event_end: new Date('2026-04-21'),
          created_at: admin.firestore.FieldValue.serverTimestamp()
        });

        eventIds[event.title] = docRef.id;
        console.log(`  ✅ ${event.title}`);
      } catch (err) {
        console.error(`  ❌ ${event.title}:`, err.message);
      }
    }

    console.log('\n📝 Creating event registrations...');

    const registrations = [
      { event_id: eventIds['Seminar Lingkungan 2024'], user_id: userIds['budi@gli.com'], name: 'Budi Santoso', email: 'budi@gli.com', phone: '081234567890', status: 'approved' },
      { event_id: eventIds['Seminar Lingkungan 2024'], user_id: userIds['siti@gli.com'], name: 'Siti Nurhaliza', email: 'siti@gli.com', phone: '082234567890', status: 'pending' },
      { event_id: eventIds['Program Penanaman Pohon'], user_id: userIds['ahmad@gli.com'], name: 'Ahmad Wijaya', email: 'ahmad@gli.com', phone: '083234567890', status: 'pending' },
      { event_id: eventIds['Workshop Daur Ulang'], user_id: userIds['budi@gli.com'], name: 'Budi Santoso', email: 'budi@gli.com', phone: '081234567890', status: 'approved' }
    ];

    for (const reg of registrations) {
      try {
        const existing = await db.collection('event_registrations')
          .where('event_id', '==', reg.event_id)
          .where('email', '==', reg.email)
          .limit(1)
          .get();

        if (existing.empty) {
          const docRef = await db.collection('event_registrations').add({
            event_id: reg.event_id,
            user_id: reg.user_id,
            name: reg.name,
            email: reg.email,
            phone: reg.phone,
            is_gli_member: 1,
            proof_img: null,
            proof_status: reg.status,
            medal_awarded: reg.status === 'approved',
            registered_at: admin.firestore.FieldValue.serverTimestamp()
          });

          console.log(`  ✅ ${reg.name}`);
        }
      } catch (err) {
        console.error(`  ❌ Registration:`, err.message);
      }
    }

    console.log('\n✅ Seeding completed!');
    console.log('📊 Summary: 5 users, 5 actions, 3 events, 4 registrations\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;