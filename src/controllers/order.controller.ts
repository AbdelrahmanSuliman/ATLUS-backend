import { Request, Response } from 'express';
import { StatusCodes } from '../utils/statusCodes';
import { HTTPError } from '../errors/HTTPError';
import { logger } from '../utils/logger';
import {checkoutService, getAllOrdersService} from '../services/order.service'

export const getAllOrdersController = async (req: Request, res: Response) => {
  const userId = Number(req.params.id)

  logger.info({ userId }, '[GET_ORDERS] Fetching all orders');

  try {
    if (!userId) {
      logger.warn({ userId }, '[GET_ORDERS] Missing userId');
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'User ID is required' });
    }

    const orders = await getAllOrdersService(userId);

    logger.info({ userId, orderCount: orders.length }, '[GET_ORDERS] Orders fetched successfully');

    res.status(StatusCodes.OK).json({ orders });
  } catch (err) {
    if (err instanceof HTTPError) {
      logger.warn({
        status: err.status,
        message: err.message,
        userId
      }, '[GET_ORDERS] HTTPError occurred');

      res.status(err.status).json({ message: err.message });
    }

    logger.error({
      userId,
      error: err
    }, '[GET_ORDERS] Unexpected error while fetching orders');

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Something went wrong while fetching orders' });
  }
};


export const checkoutController = async (req: Request, res: Response) => {
  const { userId, cart } = req.body;

  logger.info({ userId, cartItemCount: cart?.length }, '[CHECKOUT] Starting checkout');

  try {
    if (!userId || !Array.isArray(cart) || cart.length === 0) {
      logger.warn({ userId, cart }, '[CHECKOUT] Invalid input');
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid checkout request' });
    }

    const {url} = await checkoutService(userId, cart);

    logger.info({userId, cartItemCount: cart.length }, '[CHECKOUT] Order created successfully');

    res.status(StatusCodes.CREATED).json({url});
  } catch (err) {
    if (err instanceof HTTPError) {
      logger.warn({
        status: err.status,
        message: err.message,
        userId
      }, '[CHECKOUT] HTTPError occurred');

      res.status(err.status).json({ message: err.message });
    }

    logger.error({
      userId,
      cart,
      error: err
    }, '[CHECKOUT] Unexpected error during checkout');

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Something went wrong during checkout' });
  }
};