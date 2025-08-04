import { Request, Response } from 'express';
import { getUserDetailsService, updateUserDetailsService } from '../services/user.service';
import { StatusCodes } from '../utils/statusCodes';
import { HTTPError } from '../errors/HTTPError';
import {updateDetailsSchema} from '../schemas/user.schema'
import { logger } from '../utils/logger';

export const getUserDetailsController = async (req: Request, res: Response) => {

  try {
    const requester = req.user
    if (!requester) {
      throw new HTTPError(StatusCodes.UNAUTHORIZED, 'Unauthorized');
    }
    const userIdToFetch = Number(requester.sub)

    logger.info({ userIdToFetch }, '[GET USER] Starting fetch by ID');

    const userId = Number(userIdToFetch);
    console.log(`User Id: ${userId} with type of ${typeof userId}`)

    if (isNaN(userId)) {
      throw new HTTPError( StatusCodes.BAD_REQUEST, 'Invalid user ID',);
    }

    const userDetails = await getUserDetailsService(userId);

    if (!userDetails) {
      throw new HTTPError( StatusCodes.NOT_FOUND, 'User not found',);
    }

    logger.info({ userId }, '[GET USER] User details fetched successfully');

    res.status(StatusCodes.OK).json({
      message: 'User details retrieved successfully',
      data: userDetails,
    });
  } catch (err) {
    if (err instanceof HTTPError) {
      logger.warn({
        status: err.status,
        message: err.message,
      }, '[GET USER] HTTPError occurred');

      res.status(err.status).json({ message: err.message });
    } else {
      logger.error({
        error: err,
      }, '[GET USER] Unexpected error');

      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Something went wrong' });
    }
  }
};

export const updateUserDetailsContoller = async (req: Request, res: Response) => {
  try {
      const requester = req.user;
      if (!requester) {
        throw new HTTPError(StatusCodes.UNAUTHORIZED, 'Unauthorized');
      }
    logger.info({ requester }, '[UPDATE USER] Starting update by ID');
    const userId = Number(requester.sub);

    if (isNaN(userId)) {
      throw new HTTPError(StatusCodes.BAD_REQUEST, 'Invalid user ID');
    }

    const { username, email, password } = updateDetailsSchema.parse(req.body);

    const updatedUser = await updateUserDetailsService(userId, username, email, password);

    if (!updatedUser) {
      throw new HTTPError(StatusCodes.NOT_FOUND, 'User not found or update failed');
    }

    logger.info({ userId }, '[UPDATE USER] User details updated successfully');

    res.status(StatusCodes.OK).json({
      message: 'User details updated successfully',
      data: updatedUser,
    });
  } catch (err) {
    if (err instanceof HTTPError) {
      logger.warn({
        status: err.status,
        message: err.message,
      }, '[UPDATE USER] HTTPError occurred');

      res.status(err.status).json({ message: err.message });
    } else {
      logger.error({
        error: err,
      }, '[UPDATE USER] Unexpected error');

      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Something went wrong' });
    }
  }
};

