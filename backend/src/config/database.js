const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

const dbDialect = (process.env.DB_DIALECT || 'mysql').toLowerCase();

let sequelize;

if (dbDialect === 'sqlite') {
  try {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: path.join(__dirname, '../../database.sqlite'),
      logging: false,
    });
  } catch (err) {
    console.warn('⚠️ Could not initialize SQLite dialect, falling back to MySQL config:', err.message);
    sequelize = createMysqlSequelize();
  }
} else {
  sequelize = createMysqlSequelize();
}

function createMysqlSequelize() {
  if (process.env.DATABASE_URL) {
    return new Sequelize(process.env.DATABASE_URL, {
      dialect: 'mysql',
      logging: false,
      dialectOptions: process.env.DB_SSL === 'true' ? {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      } : {},
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    });
  }

  return new Sequelize(
    process.env.DB_NAME || 'pengaduan_masyarakat',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 3306),
      dialect: 'mysql',
      logging: false,
      dialectOptions: process.env.DB_SSL === 'true' ? {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      } : {},
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    }
  );
}

module.exports = sequelize;
