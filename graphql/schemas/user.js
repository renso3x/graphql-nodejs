const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLList
} = require("graphql");
const Task = require("./task");

const User = new GraphQLObjectType({
  name: "User",
  description: "Details of the user",
  fields: () => ({
    id: {
      type: GraphQLInt,
      resolve(user) {
        return user.id;
      }
    },
    firstName: {
      type: GraphQLString,
      resolve(user) {
        return user.firstName;
      }
    },
    lastName: {
      type: GraphQLString,
      resolve(user) {
        return user.lastName;
      }
    },
    email: {
      type: GraphQLString,
      resolve(user) {
        return user.email;
      }
    },
    password: { type: GraphQLString },
    tasks: {
      type: new GraphQLList(Task),
      resolve(user) {
        return user.getTasks();
      }
    }
  })
});

module.exports = User;
