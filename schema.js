const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
  GraphQLSchema,
  GraphQLNonNull
} = require("graphql");
const db = require("./db");

// User Type
const UserType = new GraphQLObjectType({
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
      type: new GraphQLList(TaskType),
      resolve(user) {
        return user.getTasks();
      }
    }
  })
});

// Task Type
const TaskType = new GraphQLObjectType({
  name: "Task",
  description: "List of todos of a user",
  fields: () => ({
    id: {
      type: GraphQLInt,
      resolve(task) {
        return task.id;
      }
    },
    name: {
      type: GraphQLString,
      resolve(task) {
        return task.name;
      }
    },
    user: {
      type: UserType,
      resolve(user) {
        return user.getUser();
      }
    }
  })
});

const Query = new GraphQLObjectType({
  name: "Query",
  description: " This is a root query",
  fields: () => {
    return {
      users: {
        type: GraphQLList(UserType),
        args: {
          id: {
            type: GraphQLInt
          },
          email: {
            type: GraphQLString
          }
        },
        resolve(_, args) {
          return db.models.user.findAll({ where: args });
        }
      },
      tasks: {
        type: GraphQLList(TaskType),
        resolve(roo, args) {
          return db.models.task.findAll({ where: args });
        }
      }
    };
  }
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  description: "Functions",
  fields: () => {
    return {
      createUser: {
        type: UserType,
        args: {
          firstName: {
            type: new GraphQLNonNull(GraphQLString)
          },
          lastName: {
            type: new GraphQLNonNull(GraphQLString)
          },
          email: {
            type: new GraphQLNonNull(GraphQLString)
          }
        },
        resolve(_, args) {
          // handle authorization here...
          return db.models.user.create({
            firstName: args.firstName,
            lastName: args.lastName,
            email: args.email.toLowerCase()
          });
        }
      },
      createTask: {
        type: TaskType,
        args: {
          task: {
            type: new GraphQLNonNull(GraphQLString)
          },
          userId: {
            type: new GraphQLNonNull(GraphQLInt)
          }
        },
        async resolve(_, args) {
          try {
            return await db.models.task.create({
              name: args.task,
              userId: args.userId
            });
          } catch (e) {
            console.log(`Error: ${e}`);
          }
        }
      }
    };
  }
});

module.exports = new GraphQLSchema({
  query: Query,
  mutation: Mutation
});
