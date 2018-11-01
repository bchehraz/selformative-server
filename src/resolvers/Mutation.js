import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { APP_SECRET, getUserId } from '../utils';

async function signup(parent, args, context, info) {
  const password = await bcrypt.hash(args.password, 10);
  const user = await context.db.mutation.createUser({
    data: { ...args, password },
  }, '{ id }');

  const token = jwt.sign({ userId: user.id }, APP_SECRET);

  return { token, user };
}

async function login(parent, args, context) {
  const user = await context.db.query.user({ where: { email: args.email } }, ' { id password } ');
  if (!user) {
    throw new Error('No such user found');
  }

  const valid = await bcrypt.compare(args.password, user.password);
  if (!valid) {
    throw new Error('Invalid password');
  }

  const token = jwt.sign({ userId: user.id }, APP_SECRET);

  return { token, user };
}

async function post(parent, args, context, info) {
  const userId = getUserId(context);
  return context.db.mutation.createLink(
    {
      data: {
        url: args.url,
        description: args.description,
        postedBy: { connect: { id: userId } },
      },
    },
    info,
  );
}

async function vote(parents, args, context, info) {
  const userId = getUserId(context);
  const linkExists = await context.db.exists.Vote({
    user: { id: userId },
    link: { id: args.linkId },
  });
  if (linkExists) {
    throw new Error(`Already voted for link: ${args.linkId}`);
  }

  return context.db.mutation.createVote(
    {
      data: {
        user: { connect: { id: userId } },
        link: { connect: { id: args.linkId } },
      },
    },
    info,
  );
}

async function joinEmailList(parents, args, context) {
  // First check to see if the email already exists
  const user = await context.db.query.user({ where: { email: args.email } }, ' { emailListMember } ');
  if (!user) {
    await context.db.mutation.createUser({
      data: { ...args, emailListMember: true },
    });
    return true;
  }

  if (!user.emailListMember) {
    await context.db.mutation.updateUser({
      data: { emailListMember: true },
      where: { email: args.email },
    });
    return true;
  }

  return false;
}

module.exports = {
  signup,
  login,
  post,
  vote,
  joinEmailList,
};
