const { GraphQLObjectType, GraphQLList } = require('graphql');

const db = require('../config/db');
const User = require('./schemas/user');
const Task = require('./schemas/task');

const RootQuery = new GraphQLObjectType({
  name: 'Query',
  description: ' This is a root query',
  fields: () => {
    return {
      users: {
        type: GraphQLList(User),
        async resolve(_, args, ctx) {
          if (!ctx.isAuth) {
            throw new Error('UnAuthorized');
          }
          try {
            const res = await db.models.user.findAll({
              where: {
                id: ctx.userId
              }
            });
            return res;
          } catch (e) {
            throw e;
          }
        }
      },
      tasks: {
        type: GraphQLList(Task),
        async resolve(_, args, ctx) {
          if (!ctx.isAuth) {
            throw new Error('UnAuthorized');
          }

          try {
            const res = await db.models.task.findAll({
              where: {
                userId: ctx.userId
              }
            });
            return res;
          } catch (e) {
            throw e;
          }
        }
      }
    };
  }
});

module.exports = RootQuery;
