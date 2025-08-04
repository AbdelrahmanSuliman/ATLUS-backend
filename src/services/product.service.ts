import { PrismaClient, Collection } from '@prisma/client';
import { HTTPError } from '../errors/HTTPError';
import { StatusCodes } from '../utils/statusCodes';

const prisma = new PrismaClient();



export const getProductsByCollectionService = async (collection: string ) => {
    const collectionEnum = Collection[collection.toUpperCase() as keyof typeof Collection];
    return await prisma.product.findMany({
        where: {
            collection: collectionEnum
        }
    })
}

export const getAllProductsService = async () => {
    return await prisma.product.findMany()
}

export const getProductByIdService = async (id: number) => {
    const product = await prisma.product.findUnique({
        where:{
            id
        }
    })
    if(!product){
        throw new HTTPError(StatusCodes.NOT_FOUND, 'PRODUCT_DOESNT_EXIST', "Product doesn't exist")
    }

    return product
}

export const createProductService = async (
    name: string,
    description: string,
    imageUrl: string,
    collection: string,
    price: number
) => {
    const collectionEnum = Collection[collection as keyof typeof Collection];
    await prisma.product.create({
        data:{
            name,
            description,
            imageUrl,
            collection: collectionEnum,
            price
        }
    })
}   


