const cron = require('node-cron');
const { TimeCapsule, FutureMail } = require('../models');
const { sendNotification } = require('./notifications');

// Check for unlockable capsules every hour
cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date();
    const capsulesToUnlock = await TimeCapsule.findAll({
      where: {
        unlock_date: { [Op.lte]: now },
        is_unlocked: false
      }
    });

    for (const capsule of capsulesToUnlock) {
      await capsule.update({ is_unlocked: true });
      await sendNotification(capsule.user_id, 'capsule_unlocked', {
        capsuleId: capsule.id,
        title: capsule.title
      });
    }
  } catch (error) {
    console.error('Scheduler error:', error);
  }
});

module.exports = { startScheduler: () => console.log('Scheduler started') };