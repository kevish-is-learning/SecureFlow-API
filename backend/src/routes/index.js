const { Router } = require('express');
const authRoutes = require('./auth.routes');
const taskRoutes = require('./task.routes');

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', uptime: process.uptime() }, message: 'Healthy' });
});

router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);

module.exports = router;
