import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { HTTPError } from '../errors/HTTPError';
import { logger } from '../utils/logger';
const prisma = new PrismaClient();

export const getUserDetailsService = async (userId: number) => {
  logger.info({ userId }, '[GET USER] Starting fetch by ID');

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (user) {
    logger.info({ userId }, '[GET USER] User details fetched successfully');
  } else {
    logger.warn({ userId }, '[GET USER] User not found');
  }

  return user;
};

export const updateUserDetailsService = async (
  userId: number,
  username: string,
  email: string,
  password: string
) => {
  logger.info({ userId, username, email }, '[UPDATE USER] Starting update by ID');

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser && existingUser.id !== userId) {
      logger.warn({ email, conflictWithUserId: existingUser.id }, '[UPDATE USER] Email already in use');
      throw new HTTPError(400, 'EMAIL_ALREADY_IN_USE', 'This email is already used by another user');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username,
        email,
        password: hashedPassword
      }
    });

    logger.info({ userId: updatedUser.id }, '[UPDATE USER] User details updated successfully');

    return updatedUser;
  } catch (error) {
    logger.error({ userId, error }, '[UPDATE USER] Unexpected error');
    throw error;
  }
};
