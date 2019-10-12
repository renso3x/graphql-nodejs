const moment = require('moment');
const _ = require('lodash');
const Faker = require('faker');
const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');

const Conn = new Sequelize('tasker', 'root', 'password', {
  host: 'localhost',
  dialect: 'mysql'
});

const Task = Conn.define('task', {
  date: {
    type: Sequelize.STRING,
    allowNull: false
  },
  note: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

const User = Conn.define('user', {
  firstName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  lastName: {
    type: Sequelize.STRING,
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
    type: Sequelize.STRING,
    allowNull: false
  }
});

//Relationship
User.hasMany(Task);
Task.belongsTo(User);

Conn.sync({ force: true }).then(() => {
  //seeder
  _.times(10, async () => {
    const hashedPassword = await bcrypt.hash('test', 10);
    return User.create({
      firstName: Faker.name.firstName(),
      lastName: Faker.name.lastName(),
      email: Faker.internet.email(),
      password: hashedPassword
    }).then(user => {
      return user.createTask({
        date: moment().format('MM/DD/YYYY'),
        note: `sample task by ${user.firstName}`
      });
    });
  });
});

module.exports = Conn;
