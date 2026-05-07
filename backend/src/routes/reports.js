const express = require('express');
const router = express.Router();
const {
  getAllReports,
  createReport,
  getReportById,
  updateReport,
  updateStatus,
  deleteReport,
  getStats,
} = require('../controllers/reportController');
const verifyToken = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');
const upload = require('../config/multer');

// Public
router.get('/', getAllReports);
router.get('/stats', getStats);
router.get('/:id', getReportById);

// Authenticated
router.post('/', verifyToken, roleMiddleware('user'), upload.single('image'), createReport);
router.put('/:id', verifyToken, roleMiddleware('user'), upload.single('image'), updateReport);
router.delete('/:id', verifyToken, deleteReport);

// Admin only
router.patch('/:id/status', verifyToken, roleMiddleware('admin', 'super_admin'), updateStatus);

module.exports = router;
