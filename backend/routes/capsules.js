const express = require('express');
const { TimeCapsule } = require('../models');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, content, unlock_date, visibility } = req.body;
    const capsule = await TimeCapsule.create({
      user_id: req.user.id,
      title,
      content,
      unlock_date,
      visibility
    });
    res.json(capsule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/my-capsules', authMiddleware, async (req, res) => {
  try {
    const capsules = await TimeCapsule.findAll({
      where: { user_id: req.user.id },
      order: [['unlock_date', 'ASC']]
    });
    res.json(capsules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;