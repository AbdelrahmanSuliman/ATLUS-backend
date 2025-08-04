import { Request, Response } from 'express';
import {
  getProductsByCollectionService,
  createProductService,
  getProductByIdService,
  getAllProductsService,
} from '../services/product.service';
import {
  createProductSchema,
  createProductType
} from '../schemas/product.schema';
import { StatusCodes } from '../utils/statusCodes';
import { HTTPError } from '../errors/HTTPError';
import { logger } from '../utils/logger';
import { ZodError } from 'zod';

export const getProductsByCollectionController = async (req: Request, res: Response) => {
  const collection = req.params.collection as string;

  logger.info({ collection }, '[GET PRODUCTS] Starting fetch by collection');

  try {
    const products = await getProductsByCollectionService(collection);

    logger.info({
      collection,
      productCount:(products ?? []).length,
    }, '[GET PRODUCTS] Successfully fetched');

    res.status(StatusCodes.OK).json({ products });
  } catch (err) {
    if (err instanceof HTTPError) {
      logger.warn({
        collection,
        status: err.status,
        message: err.message
      }, '[GET PRODUCTS] HTTPError occurred');

      res.status(err.status).json({ message: err.message });
    } else {
      logger.error({
        collection,
        error: err
      }, '[GET PRODUCTS] Unexpected error');

      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Something went wrong' });
    }
  }
};

export const getAllProductsController = async (req: Request, res: Response) => {
  logger.info('[GET ALL PRODUCTS] Starting fetch');
  try {
    const products = await getAllProductsService();

    logger.info({ count: products.length }, '[GET ALL PRODUCTS] Products fetched successfully');

    res.status(StatusCodes.OK).json({ products });
  } catch (err) {
    if (err instanceof HTTPError) {
      logger.warn({
        status: err.status,
        message: err.message
      }, '[GET ALL PRODUCTS] HTTPError occurred');

      res.status(err.status).json({ message: err.message });
    } else {
      logger.error({
        error: err
      }, '[GET ALL PRODUCTS] Unexpected error');

      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Something went wrong' });
    }
  }
};

export const getProductByIdController = async (req: Request, res: Response) => {
  const productId = req.params.id;

  logger.info({ productId }, '[GET PRODUCT] Starting fetch by ID');

  try {
    const product = await getProductByIdService(Number(productId));

    logger.info({ productId }, '[GET PRODUCT] Product found');

    res.status(StatusCodes.OK).json(product);
  } catch (err) {
    if (err instanceof HTTPError) {
      logger.warn({
        productId,
        status: err.status,
        message: err.message
      }, '[GET PRODUCT] HTTPError occurred');

      res.status(err.status).json({ message: err.message });
    } else {
      logger.error({
        productId,
        error: err
      }, '[GET PRODUCT] Unexpected error');

      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Something went wrong' });
    }
  }
};

export const createProductController = async (req: Request, res: Response) => {
  logger.info({}, '[CREATE PRODUCT] Request received');

  try {
    logger.debug({ body: req.body }, '[CREATE PRODUCT] Raw request body');

    const { name, description, collection, price }: createProductType =
      createProductSchema.parse(req.body);
    
    logger.debug({ name, collection, price }, '[CREATE PRODUCT] Parsed product data');
    const uploadedImageUrl = (req.file as Express.MulterS3.File).location;
    await createProductService(name, description, uploadedImageUrl, collection, price);

    logger.info({ name, collection }, '[CREATE PRODUCT] Product created successfully');

    res.status(StatusCodes.CREATED).json({ message: 'Product created successfully' });
  } catch (err) {
    if (err instanceof ZodError) {
      logger.warn({
        issues: err.errors
      }, '[CREATE PRODUCT] Zod validation error');

      res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Invalid input',
        issues: err.errors
      });
    } else if (err instanceof HTTPError) {
      logger.warn({
        status: err.status,
        message: err.message
      }, '[CREATE PRODUCT] HTTPError occurred');

      res.status(err.status).json({ message: err.message });
    } else {
      logger.error({ error: err }, '[CREATE PRODUCT] Unexpected error');

      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Something went wrong' });
    }
  }
};



