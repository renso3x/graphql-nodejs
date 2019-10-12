const jwt = require('jsonwebtoken');
const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLNonNull,
  GraphQLBoolean
} = require('graphql');
const bcrypt = require('bcrypt');

const db = require('../config/db');
const User = require('./schemas/user');
const Task = require('./schemas/task');
const Auth = require('./schemas/auth');

const RootMutation = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Functions',
  fields: () => {
    return {
      createUser: {
        type: User,
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
              throw new Error('User exists already');
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
        type: Task,
        args: {
          date: {
            type: new GraphQLNonNull(GraphQLString)
          },
          note: {
            type: new GraphQLNonNull(GraphQLString)
          }
        },
        async resolve(_, args, ctx) {
          if (!ctx.isAuth) {
            throw new Error('Not Authenticated');
          }

          try {
            return await db.models.task.create({
              date: args.date,
              note: args.note,
              userId: ctx.userId
            });
          } catch (e) {
            throw e;
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
        async resolve(_, args, ctx) {
          if (!ctx.isAuth) {
            throw new Error('Not Authenticated');
          }

          try {
            const res = await db.models.task.destroy({
              where: {
                id: args.taskId
              }
            });

            if (res === 0) {
              throw new Error('Sorry, unable to find task.');
            }
            return true;
          } catch (e) {
            throw e;
          }
        }
      },
      login: {
        type: Auth,
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
              throw new Error('Email and  password is incorrect');
            }

            const token = jwt.sign(
              {
                userId: user.id,
                email: user.email
              },
              'thisismysuperlongsscret',
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

module.exports = RootMutation;
