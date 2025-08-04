import { Router } from 'express';
import { validateToken } from '../middleware/jwt';
import { getUserDetailsController, updateUserDetailsContoller } from '../controllers/user.controller';

const router = Router();

router.get('/:id', validateToken, getUserDetailsController );
router.put('/:id', validateToken, updateUserDetailsContoller)
export default router;
