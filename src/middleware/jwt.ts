import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'
import { Request, Response, NextFunction } from 'express'
import type {Role} from '@prisma/client'
import {logger} from '../utils/logger'

dotenv.config()

const secret = process.env.TOKEN_SECRET as string;

type AccessPayload = {
    sub: string,
    username: string
    role: Role
}

declare global {
    namespace Express {
        interface Request {
            user?: AccessPayload
        }
    }
}



function isValidAccessPayload(payload: unknown): payload is AccessPayload {
    return typeof payload === 'object' && 
           payload !== null &&
           typeof (payload as any).sub === 'string' &&
           typeof (payload as any).username === 'string'
}

export const authorize = (...allowed: Role[]) => (req: Request, res: Response, next:NextFunction) =>{
    if(!req.user || !allowed.includes(req.user.role)) {res.status(403); return};
    next();
}

export const generateAccessToken = (user: { id: number; username: string; role: Role }) => {
  logger.info(`Generating jwt token for user with id: ${user.id}`)
  return jwt.sign(
    { sub: user.id.toString(), username: user.username, role: user.role } satisfies AccessPayload,
    secret,
    {
      algorithm: 'HS256',
      expiresIn: '30m'
    }
  )

}


export const validateToken = (req: Request, res: Response, next: NextFunction): void => {
    

    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Access token required' });
        return;
    }
    
    const token = authHeader.substring(7);
    
    try {
        const decoded = jwt.verify(token, secret);
        
        if (!isValidAccessPayload(decoded)) {
            res.status(401).json({ error: 'Invalid token payload' });
            return
        }
        
        const payload = decoded as unknown as AccessPayload;
        
        req.user = payload;
        logger.info(`Validating jwt token for user with id: ${req.user?.sub}`)

        
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({ error: 'Token expired' });
        } else if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ error: 'Invalid token' });
        } else {
            res.status(500).json({ error: 'Token validation failed' });
        }
    }
}