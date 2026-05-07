const express = require('express');
const router = express.Router();
const { updateComment, deleteComment } = require('../controllers/commentController');
const verifyToken = require('../middleware/auth');

router.put('/:id', verifyToken, updateComment);
router.delete('/:id', verifyToken, deleteComment);

module.exports = router;
