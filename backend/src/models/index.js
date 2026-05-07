const User = require('./User');
const Category = require('./Category');
const Report = require('./Report');
const Comment = require('./Comment');

// User <-> Report (one to many)
User.hasMany(Report, { foreignKey: 'user_id', as: 'reports' });
Report.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Category <-> Report (one to many)
Category.hasMany(Report, { foreignKey: 'category_id', as: 'reports' });
Report.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// Report <-> Comment (one to many)
Report.hasMany(Comment, { foreignKey: 'report_id', as: 'comments' });
Comment.belongsTo(Report, { foreignKey: 'report_id', as: 'report' });

// User <-> Comment (one to many)
User.hasMany(Comment, { foreignKey: 'user_id', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = { User, Category, Report, Comment };
