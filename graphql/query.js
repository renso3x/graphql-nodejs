const jwt = require("jsonwebtoken");
const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull
} = require("graphql");
const bcrypt = require("bcrypt");

const db = require("../config/db");
const User = require("./schemas/user");
const Task = require("./schemas/task");
const Auth = require("./schemas/auth");

const RootQuery = new GraphQLObjectType({
  name: "Query",
  description: " This is a root query",
  fields: () => {
    return {
      users: {
        type: GraphQLList(User),
        async resolve(_, args, ctx) {
          if (!ctx.isAuth) {
            throw new Error("UnAuthorized");
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
        resolve(_, args) {
          return db.models.task.findAll({ where: args });
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

module.exports = RootQuery;
