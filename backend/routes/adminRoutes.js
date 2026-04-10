// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/stats', protect, adminOnly, adminController.getDashboardStats);
router.get('/profile/stats', protect, adminOnly, adminController.getAdminStats);
router.get('/users', protect, adminOnly, adminController.getUsers);
router.get('/users/:id', protect, adminOnly, adminController.getUserDetail);
router.delete('/users/:id', protect, adminOnly, adminController.deleteUser); // ✅ NEW: Delete user
router.get('/actions', protect, adminOnly, adminController.getAllActions);
router.put('/actions/:id', protect, adminOnly, adminController.verifyAction);
// ✅ KEEP: Admin leaderboard (untuk admin dashboard - top performer)
router.get('/leaderboard', protect, adminOnly, adminController.getLeaderboard);

module.exports = router;