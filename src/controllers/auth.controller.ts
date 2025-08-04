import { Request, Response} from 'express';
import { signupService, loginService } from '../services/auth.service'
import {StatusCodes} from '../utils/statusCodes'
import {signUpType, signUpSchema, logInType, loginSchema} from '../schemas/user.schema'
import { ZodError } from 'zod';
import { HTTPError } from '../errors/HTTPError';
import {generateAccessToken} from '../middleware/jwt'
import {logger} from '../utils/logger'


export const signUpController = async (req: Request, res: Response) => {
    try{
        const {username , email, password}: signUpType = signUpSchema.parse(req.body);
        logger.info(`user with email ${email} is signing up`)
        const user = await signupService(email, username, password);
        logger.info("User successfully signed up")
        const token = generateAccessToken(user)
        res.status(StatusCodes.OK).json({id: user.id, token, role: user.role})
    } catch (err){
        if(err instanceof ZodError){
            res.status(StatusCodes.BAD_REQUEST).json({message: 'Invalid input', issues: err})
        }
        else if(err instanceof HTTPError){
            res.status(err.status).json({message: err.message})
        } else{
            console.log(err)
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: 'Something went wrong'})
        }
    }
}

export const loginController = async (req: Request, res: Response) => {
    try{
        const {email, password}: logInType = loginSchema.parse(req.body);
        const user = await loginService(email, password);
        const token = generateAccessToken(user)
        res.status(StatusCodes.OK).json({id: user.id, token, role: user.role})
    } catch (err){
        if(err instanceof ZodError){
            res.status(StatusCodes.BAD_REQUEST).json({message: 'Invalid input', issues: err})
        }
        else if(err instanceof HTTPError){
            res.status(err.status).json({message: err.message})
        } else{
            console.log(err)
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: 'Something went wrong'})
        }
    }
}