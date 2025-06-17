const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TimeCapsule = sequelize.define('TimeCapsule', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT
    },
    media_url: {
      type: DataTypes.STRING(255)
    },
    media_type: {
      type: DataTypes.STRING(50)
    },
    unlock_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    visibility: {
      type: DataTypes.ENUM('private', 'shared', 'public'),
      defaultValue: 'private'
    },
    is_unlocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });

  return TimeCapsule;
};