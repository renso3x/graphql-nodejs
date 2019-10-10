const moment = require("moment");
const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
  GraphQLSchema,
  GraphQLNonNull,
  GraphQLBoolean
} = require("graphql");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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
    date: {
      type: GraphQLString,
      resolve(task) {
        return task.date;
      }
    },
    note: {
      type: GraphQLString,
      resolve(task) {
        return task.note;
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

const AuthType = new GraphQLObjectType({
  name: "Auth",
  description: "Auth Details",
  fields: () => ({
    userId: {
      type: GraphQLInt
    },
    token: {
      type: GraphQLString
    },
    tokenExpiration: {
      type: GraphQLInt
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
        resolve(root, args) {
          return db.models.task.findAll({ where: args });
        }
      },
      login: {
        type: AuthType,
        args: {
          email: {
            type: new GraphQLNonNull(GraphQLString)
          },
          password: {
            type: new GraphQLNonNull(GraphQLString)
          }
        },
        async resolve(_, args) {
          try {
            const user = await db.models.user.findOne({
              where: {
                email: args.email
              }
            });

            if (!user) {
              throw new Error("User doesn't exist");
            }

            const isEqual = await bcrypt.compare(args.password, user.password);

            if (!isEqual) {
              throw new Error("Email and  password is incorrect");
            }

            const token = jwt.sign(
              {
                userId: user.id,
                email: user.email
              },
              "thisismysuperlongsscret",
              { expiresIn: 60 * 60 }
            );

            return {
              userId: user.id,
              token,
              tokenExpiration: 60 * 60
            };
          } catch (e) {
            throw e;
          }
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
          },
          password: {
            type: new GraphQLNonNull(GraphQLString)
          }
        },
        async resolve(_, args) {
          try {
            const exisitingUser = await db.models.user.findOne({
              where: {
                email: args.email
              }
            });

            if (exisitingUser) {
              throw new Error("User exists already");
            }

            const hashedPassword = await bcrypt.hash(args.password, 10);
            return db.models.user.create({
              firstName: args.firstName,
              lastName: args.lastName,
              email: args.email.toLowerCase(),
              password: hashedPassword
            });
          } catch (e) {
            throw e;
          }
        }
      },
      createTask: {
        type: TaskType,
        args: {
          date: {
            type: new GraphQLNonNull(GraphQLString)
          },
          note: {
            type: new GraphQLNonNull(GraphQLString)
          },
          userId: {
            type: new GraphQLNonNull(GraphQLInt)
          }
        },
        async resolve(_, args) {
          try {
            return await db.models.task.create({
              date: args.date,
              note: args.note,
              userId: args.userId
            });
          } catch (e) {
            throw err;
          }
        }
      },
      removeTask: {
        type: GraphQLBoolean,
        args: {
          taskId: {
            type: new GraphQLNonNull(GraphQLInt)
          }
        },
        async resolve(_, args) {
          try {
            const res = await db.models.task.destroy({
              where: {
                id: args.taskId
              }
            });

            if (res === 0) {
              throw new Error("Sorry, unable to find task.");
            }
            return true;
          } catch (e) {
            throw e;
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
