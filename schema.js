const graphql = require('graphql');

const Task = new graphql.GraphQLObjectType({
   name: 'Task',
   fields: () => ({
      task: {
         type: graphql.GraphQLString,
         resolve: (task) => task.name
      }
   })
})

module.exports.schema = new graphql.GraphQLSchema({ query: Task });