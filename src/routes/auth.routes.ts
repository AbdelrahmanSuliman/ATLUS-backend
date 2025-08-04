import { Router } from 'express';
import { signUpController, loginController } from '../controllers/auth.controller';
import { validateToken } from '../middleware/jwt';

const router = Router();

// Local auth
router.post('/signup', signUpController);
router.post('/login', loginController);



export default router;
