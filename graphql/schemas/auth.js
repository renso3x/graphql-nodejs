const { GraphQLObjectType, GraphQLInt, GraphQLString } = require("graphql");

const Auth = new GraphQLObjectType({
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

module.exports = Auth;
