import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import orderRoutes from './routes/order.routes'
import userRoutes from './routes/user.routes'
import { apiLimiter } from './middleware/rateLimiter'


dotenv.config();

const app = express();
app.set('trust proxy', 1);
const allowedOrigins = [
  'http://localhost:3000',
  'https://atlus-frontend.vercel.app',
  'https://atlus-frontend-jtq0601km-abdelrahman-ahmeds-projects-9c1bba00.vercel.app',
  'https://atlus-frontend-5tmh8lbjc-abdelrahman-ahmeds-projects-9c1bba00.vercel.app/'
];


const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

app.use(apiLimiter)
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/users', userRoutes)

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API running on http://localhost:${port}`));
