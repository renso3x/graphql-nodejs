const express = require('express');
const graphqlHTTP = require('express-graphql');
const schema = require('./schema');

const app = express();

app.use('/api', graphqlHTTP({
   schema: schema,
   graphiql: true,
}));

app.listen(4000);