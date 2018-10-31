import { GraphQLServer } from 'graphql-yoga';
import { Prisma } from 'prisma-binding';
import {
  Query,
  AuthPayload,
  Mutation,
  Subscription,
  Feed,
} from './resolvers';

const resolvers = {
  Query,
  AuthPayload,
  Mutation,
  Subscription,
  Feed,
};

const server = new GraphQLServer({
  typeDefs: './schema.graphql',
  resolvers,
  context: req => ({
    ...req,
    db: new Prisma({
      typeDefs: 'src/generated/prisma.graphql',
      endpoint: 'https://us1.prisma.sh/babak-chehraz-c82cf9/database/dev',
      secret: 'mysecret123',
      debug: true,
    }),
  }),
});

server.start(() => console.log('Server is running on http://localhost:4000'));
