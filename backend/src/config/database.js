const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

const dbDialect = process.env.DB_DIALECT || 'mysql';

let sequelize;

if (dbDialect === 'sqlite') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../database.sqlite'),
    logging: false,
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'pengaduan_masyarakat',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
    {
      host: process.env.DB_HOST || 'localhost',
      dialect: 'mysql',
      logging: false,
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
