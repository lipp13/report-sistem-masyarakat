const { Report, User, Category, Comment } = require('../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

const uploadsAbsoluteDir = path.join(__dirname, '../../uploads');

function resolveUploadDiskPath(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') return null;
  const normalized = imageUrl.replace(/^\/uploads\/?/, '').replace(/^\//, '');
  if (!normalized || normalized.includes('..')) return null;
  return path.join(uploadsAbsoluteDir, normalized);
}

// GET /api/reports
const getAllReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category_id, search, user_id } = req.query;
    const offset = (page - 1) * limit;
    const where = {};

    if (status) where.status = status;
    if (category_id) where.category_id = category_id;
    if (user_id) where.user_id = user_id;
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { location: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Report.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatar'] },
        { model: Category, as: 'category', attributes: ['id', 'name', 'icon', 'color'] },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Get reports error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// POST /api/reports
const createReport = async (req, res) => {
  try {
    const { title, description, location, category_id, latitude, longitude } = req.body;

    if (!title || !description || !category_id) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'title, description, category_id are required.' });
    }

    const category = await Category.findByPk(category_id);
    if (!category) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const report = await Report.create({
      user_id: req.user.id,
      category_id,
      title,
      description,
      location,
      latitude: latitude === undefined || latitude === '' ? null : latitude,
      longitude: longitude === undefined || longitude === '' ? null : longitude,
      image_url,
    });

    const fullReport = await Report.findByPk(report.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatar'] },
        { model: Category, as: 'category', attributes: ['id', 'name', 'icon', 'color'] },
      ],
    });

    return res.status(201).json({ success: true, message: 'Report created.', data: fullReport });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    console.error('Create report error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// GET /api/reports/:id
const getReportById = async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatar'] },
        { model: Category, as: 'category', attributes: ['id', 'name', 'icon', 'color'] },
        {
          model: Comment,
          as: 'comments',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar'] }],
          order: [['created_at', 'ASC']],
        },
      ],
    });

    if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });

    return res.status(200).json({ success: true, data: report });
  } catch (error) {
    console.error('Get report error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// PUT /api/reports/:id
const updateReport = async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });

    // Only owner or admin can update
    const isOwner = report.user_id === req.user.id;
    const isAdmin = ['admin', 'super_admin'].includes(req.user.role);
    if (!isOwner && !isAdmin) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const { title, description, location, category_id, latitude, longitude } = req.body;
    if (title) report.title = title;
    if (description) report.description = description;
    if (location !== undefined) report.location = location;
    if (latitude !== undefined) report.latitude = latitude === '' ? null : latitude;
    if (longitude !== undefined) report.longitude = longitude === '' ? null : longitude;
    if (category_id) report.category_id = category_id;
    if (req.file) {
      // Delete old image
      if (report.image_url) {
        const oldPath = resolveUploadDiskPath(report.image_url);
        if (oldPath && fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      report.image_url = `/uploads/${req.file.filename}`;
    }

    await report.save();

    return res.status(200).json({ success: true, message: 'Report updated.', data: report });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    console.error('Update report error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// PATCH /api/reports/:id/status
const updateStatus = async (req, res) => {
  try {
    const { status, admin_note } = req.body;
    const allowed = ['pending', 'approved', 'rejected'];

    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be pending, approved, or rejected.' });
    }

    const report = await Report.findByPk(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });

    report.status = status;
    if (admin_note !== undefined) report.admin_note = admin_note;
    await report.save();

    return res.status(200).json({ success: true, message: `Report status updated to ${status}.`, data: report });
  } catch (error) {
    console.error('Update status error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// DELETE /api/reports/:id
const deleteReport = async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });

    const isOwner = report.user_id === req.user.id;
    const isAdmin = ['admin', 'super_admin'].includes(req.user.role);
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Delete image
    if (report.image_url) {
      const imgPath = resolveUploadDiskPath(report.image_url);
      if (imgPath && fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await report.destroy();
    return res.status(200).json({ success: true, message: 'Report deleted.' });
  } catch (error) {
    console.error('Delete report error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// GET /api/reports/stats
const getStats = async (req, res) => {
  try {
    const [total, pending, approved, rejected] = await Promise.all([
      Report.count(),
      Report.count({ where: { status: 'pending' } }),
      Report.count({ where: { status: 'approved' } }),
      Report.count({ where: { status: 'rejected' } }),
    ]);

    return res.status(200).json({
      success: true,
      data: { total, pending, approved, rejected },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

module.exports = { getAllReports, createReport, getReportById, updateReport, updateStatus, deleteReport, getStats };
