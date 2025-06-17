const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    profile_image: {
      type: DataTypes.STRING(255)
    }
  });

  User.beforeCreate(async (user) => {
    if (user.password_hash) {
      user.password_hash = await bcrypt.hash(user.password_hash, 10);
    }
  });

  User.prototype.validatePassword = function(password) {
    return bcrypt.compare(password, this.password_hash);
  };

  return User;
};