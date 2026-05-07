const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, changePassword } = require('../controllers/authController');
const verifyToken = require('../middleware/auth');
const upload = require('../config/multer');

router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyToken, getMe);
router.put('/profile', verifyToken, upload.single('avatar'), updateProfile);
router.put('/change-password', verifyToken, changePassword);

module.exports = router;
