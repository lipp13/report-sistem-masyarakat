const express = require('express');
const router = express.Router({ mergeParams: true });
const { getComments, createComment } = require('../controllers/commentController');
const verifyToken = require('../middleware/auth');

// GET /api/reports/:report_id/comments
router.get('/', getComments);

// POST /api/reports/:report_id/comments
router.post('/', verifyToken, createComment);

module.exports = router;
