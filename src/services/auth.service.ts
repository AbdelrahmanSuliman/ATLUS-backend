import { PrismaClient } from '@prisma/client';
import { HTTPError } from '../errors/HTTPError';
import * as bcrypt from 'bcrypt';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export const signupService = async (
  email: string,
  username: string,
  password: string
) => {
  logger.info({ email: email }, 'Starting signup service');

  const existingUser = await prisma.user.findUnique({
    where: { email: email }
  });

  if (existingUser) {
    logger.warn({ email }, 'Signup failed: user already exists');
    throw new HTTPError(400, 'USER_ALREADY_EXISTS', 'User already exists');
  }

  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(password, salt);

  logger.info({ email: email, username }, 'Creating new user');
  const newUser = await prisma.user.create({
    data: {
      email: email,
      username,
      password: hashedPassword
    }
  });

  logger.info({ userId: newUser.id, email: newUser.email }, 'User successfully signed up');
  return newUser;
};



export const loginService = async (
  email: string,
  password: string
) => {
  logger.info({ email }, 'Starting login service');

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    logger.warn({ email }, 'Login failed: user not found');
    throw new HTTPError(404, 'USER_NOT_FOUND', 'User not found');
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password as string);

  if (!isPasswordCorrect) {
    logger.warn({ email }, 'Login failed: invalid credentials');
    throw new HTTPError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  logger.info({ userId: user.id, email }, 'User successfully logged in');
  return user;
};

