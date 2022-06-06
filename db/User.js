const Sequelize = require('sequelize')
const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 7

const User = db.define('user', {
  username: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: Sequelize.STRING
  }
})

module.exports = User;

User.prototype.correctPassword = function (userPassword) {
  return bcrypt.compare(userPassword, this.password)
}

User.prototype.generateToke = function () {
  return jwt.sign({ id: this.id }, process.env.JWT)
}

User.authenticate = async function ({ email, password }) {
  const user = await this.findOne({
    where: {
      email
    }
  })
  if (!user || !(await user.correctPassword(password))) {
    const error = Error('Incorret email/password')
    error.status = 401
    throw error
  }
  return user.generateToken()
}

User.findByToken = async function (token) {
  try {
    const { id } = await jwt.verify(token, process.env.JWT)
    const user = User.findByPk(id)
    if (!user) {
      throw 'Not the user'
    }
    return user
  } catch (err) {
    const error = Error('bad token')
    error.status = 401
    throw error
  }
}

const hashPassword = async (user) => {
  if (user.changed('password')) {
    user.password = await bcrypt.hash(user.password, SALT_ROUNDS)
  }
}

User.beforeCreate(hashPassword)
User.beforeUpdate(hashPassword)
User.beforeBulkCreate((users) => Promise.all(users.map(hashPassword)))
