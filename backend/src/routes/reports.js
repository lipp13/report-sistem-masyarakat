const express = require('express');
const router = express.Router();
const {
  getAllReports,
  createReport,
  getReportById,
  updateReport,
  updateStatus,
  toggleVoteReport,
  deleteReport,
  getStats,
} = require('../controllers/reportController');
const verifyToken = require('../middleware/auth');
const { optionalAuth } = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');
const upload = require('../config/multer');

// Public / Optional Auth
router.get('/', optionalAuth, getAllReports);
router.get('/stats', getStats);
router.get('/:id', optionalAuth, getReportById);

// Authenticated (User / Admin / Super Admin)
router.post('/', verifyToken, upload.single('image'), createReport);
router.put('/:id', verifyToken, upload.single('image'), updateReport);
router.post('/:id/vote', verifyToken, toggleVoteReport);
router.delete('/:id', verifyToken, deleteReport);

// Admin only
router.patch('/:id/status', verifyToken, roleMiddleware('admin', 'super_admin'), updateStatus);

module.exports = router;
