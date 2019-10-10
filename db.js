const moment = require("moment");
const _ = require("lodash");
const Faker = require("faker");
const Sequelize = require("sequelize");

const Conn = new Sequelize("tasker", "postgres", "postgres", {
  host: "localhost",
  dialect: "postgres"
});

const Task = Conn.define("task", {
  date: {
    type: Sequelize.STRING,
    allowNull: false
  },
  note: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

const User = Conn.define("user", {
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
  }
});

//Relationship
User.hasMany(Task);
Task.belongsTo(User);

Conn.sync({ force: true }).then(() => {
  _.times(10, () => {
    return User.create({
      firstName: Faker.name.firstName(),
      lastName: Faker.name.lastName(),
      email: Faker.internet.email()
    }).then(user => {
      return user.createTask({
        date: moment().format("MM/DD/YYYY"),
        note: `sample task by ${user.firstName}`
      });
    });
  });
});

module.exports = Conn;
