const { GraphQLObjectType, GraphQLInt, GraphQLString } = require("graphql");

const Task = new GraphQLObjectType({
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
    }
  })
});

module.exports = Task;
