const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReportVote = sequelize.define(
  'ReportVote',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    report_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'report_votes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['report_id', 'user_id'],
      },
    ],
  }
);

module.exports = ReportVote;
