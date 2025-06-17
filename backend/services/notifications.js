const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const sendNotification = async (userId, type, data) => {
  try {
    // Get user's FCM token from database
    const user = await User.findByPk(userId);
    if (!user.fcm_token) return;

    const message = {
      token: user.fcm_token,
      notification: {
        title: getNotificationTitle(type),
        body: getNotificationBody(type, data)
      },
      data: {
        type,
        ...data
      }
    };

    await admin.messaging().send(message);
  } catch (error) {
    console.error('Notification error:', error);
  }
};

const getNotificationTitle = (type) => {
  switch (type) {
    case 'capsule_unlocked':
      return '🎉 Time Capsule Unlocked!';
    case 'future_mail':
      return '📬 You have Future Mail!';
    default:
      return 'TimeLoop Notification';
  }
};

module.exports = { sendNotification };