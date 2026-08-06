require('dotenv').config();
const app = require('./src/app');
const sequelize = require('./src/config/database');
const { User, Category, Report } = require('./src/models');

const PORT = process.env.PORT || 5000;

const seedData = async () => {
  try {
    // Seed super admin
    let superAdmin = await User.findOne({ where: { email: 'superadmin@pengaduan.com' } });
    if (!superAdmin) {
      superAdmin = await User.create({
        name: 'Super Admin',
        email: 'superadmin@pengaduan.com',
        password: 'admin123',
        role: 'super_admin',
      });
      console.log('✅ Super Admin created: superadmin@pengaduan.com / admin123');
    }

    // Seed admin
    let adminUser = await User.findOne({ where: { email: 'admin@pengaduan.com' } });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Admin Petugas',
        email: 'admin@pengaduan.com',
        password: 'admin123',
        role: 'admin',
      });
      console.log('✅ Admin created: admin@pengaduan.com / admin123');
    }

    // Seed demo citizen user
    let citizenUser = await User.findOne({ where: { email: 'warga@pengaduan.com' } });
    if (!citizenUser) {
      citizenUser = await User.create({
        name: 'Budi Santoso',
        email: 'warga@pengaduan.com',
        password: 'user123',
        role: 'user',
        phone: '081234567890',
        address: 'Jl. Sudirman No. 45, Jakarta',
      });
      console.log('✅ Demo Citizen created: warga@pengaduan.com / user123');
    }

    // Seed categories
    const categoryCount = await Category.count();
    if (categoryCount === 0) {
      await Category.bulkCreate([
        { name: 'Infrastruktur', description: 'Jalan berlubang, jembatan rusak, drainase tersumbat', icon: '🏗️', color: '#f59e0b' },
        { name: 'Lingkungan', description: 'Sampah menumpuk, pencemaran, pohon rawan tumbang', icon: '🌿', color: '#10b981' },
        { name: 'Keamanan', description: 'Kriminalitas, penerangan jalan umum, gangguan ketertiban', icon: '🛡️', color: '#ef4444' },
        { name: 'Kesehatan', description: 'Fasilitas kesehatan, kebersihan publik, wabah', icon: '🏥', color: '#3b82f6' },
        { name: 'Pendidikan', description: 'Kerusakan bangunan sekolah, fasilitas belajar', icon: '📚', color: '#8b5cf6' },
        { name: 'Transportasi', description: 'Kemacetan, lampu lalu lintas padam, angkutan umum', icon: '🚌', color: '#06b6d4' },
        { name: 'Sosial', description: 'Bantuan sosial, tunawisma, masalah kesejahteraan', icon: '🤝', color: '#f97316' },
        { name: 'Lainnya', description: 'Laporan dan pengaduan umum masyarakat', icon: '📋', color: '#6b7280' },
      ]);
      console.log('✅ Categories seeded.');
    }

    // Seed initial reports if empty
    const reportCount = await Report.count();
    if (reportCount === 0 && citizenUser) {
      const infraCat = await Category.findOne({ where: { name: 'Infrastruktur' } });
      const envCat = await Category.findOne({ where: { name: 'Lingkungan' } });
      const secCat = await Category.findOne({ where: { name: 'Keamanan' } });

      await Report.bulkCreate([
        {
          user_id: citizenUser.id,
          category_id: infraCat ? infraCat.id : 1,
          title: 'Jalan Berlubang Parah di Depan Stasiun',
          description: 'Ada lubang diameter sekitar 1 meter dengan kedalaman 15cm yang membahayakan pengendara motor saat hujan turun.',
          location: 'Jl. Raya Jendral Sudirman No. 12, Jakarta Pusat',
          latitude: -6.2088,
          longitude: 106.8456,
          status: 'in_progress',
          admin_note: 'Petugas Dinas PU telah menjadwalkan penambalan pada hari Jumat ini.',
          votes_count: 14,
        },
        {
          user_id: citizenUser.id,
          category_id: envCat ? envCat.id : 2,
          title: 'Penumpukan Sampah Liar di Pinggir Kali',
          description: 'Bau menyengat dan sampah plastik menumpuk karena tidak ada tempat sampah sementara di area perumahan warga.',
          location: 'Kecamatan Kebayoran Baru, Jakarta Selatan',
          latitude: -6.2444,
          longitude: 106.7992,
          status: 'resolved',
          admin_note: 'Tim Kebersihan DLH sudah mengangkut seluruh sampah dan memasang papan larangan membuang sampah.',
          votes_count: 28,
        },
        {
          user_id: citizenUser.id,
          category_id: secCat ? secCat.id : 3,
          title: 'Lampu Penerangan Jalan Umum (PJU) Padam',
          description: 'Lampu PJU di sepanjang gang utama mati sejak 3 hari lalu, membuat area rawan tindak kejahatan malam hari.',
          location: 'Jl. Mangga Besar IX, Jakarta Barat',
          latitude: -6.1481,
          longitude: 106.8283,
          status: 'pending',
          admin_note: null,
          votes_count: 8,
        },
      ]);
      console.log('✅ Initial reports seeded.');
    }
  } catch (err) {
    console.error('Seed error:', err);
  }
};

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected.');

    await sequelize.sync({ alter: true });
    console.log('✅ Database synced.');

    await seedData();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📂 API Health: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

start();
