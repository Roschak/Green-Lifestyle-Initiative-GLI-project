// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const upload = require('../config/multer');
const { protect } = require('../middleware/authMiddleware');

router.post('/actions', protect, upload.single('image'), userController.createAction);
router.get('/stats/:id', protect, userController.getUserStats);
router.get('/actions/:id', protect, userController.getUserActions);
router.get('/profile/:id', protect, userController.getUserProfile);

module.exports = router;