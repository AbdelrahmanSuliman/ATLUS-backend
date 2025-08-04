import { Router } from 'express';
import {createProductController, getAllProductsController, getProductByIdController, getProductsByCollectionController } from '../controllers/product.controller';
import {upload} from '../middleware/uploader'

const router = Router();

router.get('/collections/:collection', getProductsByCollectionController)
router.get('/:id', getProductByIdController)
router.post('/new', upload.single('image'), createProductController)
router.get('',getAllProductsController)
export default router
