import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

class JwtAuth {

    createToken(user: {id: number}, secretKey: string){
        return jwt.sign(user, secretKey);
    }

    verifyToken(req: Request, res: Response, next: NextFunction){
        if(req.headers.authorization !== undefined){
            const token = req.headers.authorization.split(' ')[2];
            jwt.verify(token, process.env.TOKEN_KEY as string, (err, decode) => {
                if(err){
                    return res.status(401).json({
                        message: "Failed to authenticate token..."
                    })
                }else{
                    next();
                }
            });
        }
    }

}

const jwtAuth = new JwtAuth();
export default jwtAuth;