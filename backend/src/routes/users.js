const express = require('express');
const router = express.Router();
const { getAllUsers, createUser, getUserById, updateUser, deleteUser } = require('../controllers/userController');
const verifyToken = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

router.use(verifyToken);
router.use(roleMiddleware('super_admin'));

router.get('/', getAllUsers);
router.post('/', createUser);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
