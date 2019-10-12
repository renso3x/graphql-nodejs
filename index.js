const express = require('express');
const graphqlHTTP = require('express-graphql');
const cors = require('cors');

const schema = require('./graphql');
const isAuth = require('./middleware/is-auth');

const app = express();

app.use(cors());
app.use(isAuth);
app.use(
  '/api',
  graphqlHTTP({
    schema: schema,
    graphiql: true
  })
);

app.listen(4000, () => {
  console.log(`Connecting to port ${4000}`);
});
