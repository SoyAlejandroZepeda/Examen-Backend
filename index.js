const { ApolloServer } = require('apollo-server');
const typeDefs = require('./db/schemas');
const resolvers = require('./db/resolvers');

const connectDB = require('./config/db');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'variables.env' });

//Connect to database
connectDB();

//Server
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
        const token = req.headers['auth'] || '';
        if(token) {
            try {
                const user = jwt.verify(token.replace('Bearer ', ''), process.env.SECRET);
                return {
                    user
                }
            } catch (error) {
                console.log('Something went wrong verifing token');
            }
        }
    }
});

//Start server
server.listen({ port: process.env.PORT || 4000 }).then( ({url}) => {
    console.log(`Server ready on ${url}`);
});