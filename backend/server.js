require('dotenv').config();
const app = require('./src/app');
const sequelize = require('./src/config/database');
const { User, Category } = require('./src/models');
const bcrypt = require('bcryptjs');

const PORT = process.env.PORT || 5000;

const seedData = async () => {
  try {
    // Seed super admin
    const adminExists = await User.findOne({ where: { email: 'superadmin@pengaduan.com' } });
    if (!adminExists) {
      await User.create({
        name: 'Super Admin',
        email: 'superadmin@pengaduan.com',
        password: 'admin123',
        role: 'super_admin',
      });
      console.log('✅ Super Admin created: superadmin@pengaduan.com / admin123');
    }

    // Seed admin
    const adminUser = await User.findOne({ where: { email: 'admin@pengaduan.com' } });
    if (!adminUser) {
      await User.create({
        name: 'Admin',
        email: 'admin@pengaduan.com',
        password: 'admin123',
        role: 'admin',
      });
      console.log('✅ Admin created: admin@pengaduan.com / admin123');
    }

    // Seed categories
    const categoryCount = await Category.count();
    if (categoryCount === 0) {
      await Category.bulkCreate([
        { name: 'Infrastruktur', description: 'Jalan, jembatan, drainase', icon: '🏗️', color: '#f59e0b' },
        { name: 'Lingkungan', description: 'Sampah, polusi, kebersihan', icon: '🌿', color: '#10b981' },
        { name: 'Keamanan', description: 'Kriminalitas, ketertiban umum', icon: '🛡️', color: '#ef4444' },
        { name: 'Kesehatan', description: 'Fasilitas kesehatan, sanitasi', icon: '🏥', color: '#3b82f6' },
        { name: 'Pendidikan', description: 'Sekolah, fasilitas belajar', icon: '📚', color: '#8b5cf6' },
        { name: 'Transportasi', description: 'Angkutan umum, lalu lintas', icon: '🚌', color: '#06b6d4' },
        { name: 'Sosial', description: 'Bantuan sosial, kesejahteraan', icon: '🤝', color: '#f97316' },
        { name: 'Lainnya', description: 'Pengaduan lain-lain', icon: '📋', color: '#6b7280' },
      ]);
      console.log('✅ Categories seeded.');
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
      console.log(`📂 API Docs: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

start();
