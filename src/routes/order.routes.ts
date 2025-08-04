import { Router } from 'express';
import {checkoutController, getAllOrdersController} from '../controllers/order.controller'

const router = Router();

router.post('/checkout', checkoutController)
router.get('/:id', getAllOrdersController)
export default router;
