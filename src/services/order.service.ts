import { PrismaClient} from '@prisma/client';
import { HTTPError } from '../errors/HTTPError';
import { StatusCodes } from '../utils/statusCodes';
import {getProductByIdService} from '../services/product.service'
import {stripe} from '../utils/stripe'

const prisma = new PrismaClient();

type CartItem = {
    productId: number,
    quantity: number
}

export const getAllOrdersService = async (userId: number) => {
    const orders = await prisma.order.findMany({
        where: {userId},
        include: {
          orderItems: {
            select: {
              quantity: true,
              product: {
                select: {
                  name: true,
                  description: true,
                  price: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
      });
  return orders
}

const createOrderItem = async (orderId: number, cartItem: CartItem) => {
  const product = await getProductByIdService(cartItem.productId)

  return await prisma.orderItem.create({
    data: {
      orderId,
      productId: cartItem.productId,
      quantity: cartItem.quantity,
      price: product.price
    }
  })
}



export const checkoutService = async (userId: number, cartItems: CartItem[]) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new HTTPError(StatusCodes.NOT_FOUND, 'USER_DOESNT_EXIST', "User doesn't exist");
  }

  const lineItems = await Promise.all(
    cartItems.map(async (item) => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        throw new HTTPError(StatusCodes.NOT_FOUND, 'PRODUCT_NOT_FOUND', `Product ${item.productId} not found`);
      }

      const baseUrl = process.env.BACKEND_URL?.replace(/\/$/, '');
      const path = product.imageUrl?.startsWith('/') ? product.imageUrl : `/${product.imageUrl}`;
      const imageUrl = product.imageUrl ? `${baseUrl}${path}` : undefined;
      
      const stripeProduct = await stripe.products.create({
        name: product.name,
        images: imageUrl ? [imageUrl] : [],
      });

      const stripePrice = await stripe.prices.create({
        unit_amount:  Math.round(product.price * 100),
        currency: 'usd',
        product: stripeProduct.id,
      });

      return {
        price: stripePrice.id,
        quantity: item.quantity,
      };
    })
  );

  const session = await stripe.checkout.sessions.create({
    line_items: lineItems,
    mode: 'payment',
    success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    metadata: {
      userId: userId.toString()
    }
  });

  return { url: session.url };
};


