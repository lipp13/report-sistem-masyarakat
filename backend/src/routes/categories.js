const express = require('express');
const router = express.Router();
const { getAllCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const verifyToken = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

router.get('/', getAllCategories);
router.post('/', verifyToken, roleMiddleware('super_admin'), createCategory);
router.put('/:id', verifyToken, roleMiddleware('super_admin'), updateCategory);
router.delete('/:id', verifyToken, roleMiddleware('super_admin'), deleteCategory);

module.exports = router;
