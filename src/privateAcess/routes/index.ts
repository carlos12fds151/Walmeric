import { Request, Response, Router } from 'express';
import jwtAuth from '../../middlewares/jwt';
import { get, set } from '../../middlewares/redis/index';

class PrivateRoute {

    router: Router;

    constructor(){
        this.router = Router();
        this.routes();
    }

    async getPrivateRoute(req: Request, res: Response){
        let privateRoute;
        const redisGet = JSON.parse(await get('messagePrivate') as string);
        if(redisGet !== null){
            privateRoute = redisGet;
        }else{
         privateRoute = { messagePrivate: "[PRIVATE ROUTE] Hola desde fuera de redis" };
         await set('messagePrivate', JSON.stringify({ messagePrivate: "[PRIVATE ROUTE] Hola desde Redis" }));
        }
        return res.send(privateRoute);
    }

    routes(){
        this.router.get('/api/private', jwtAuth.verifyToken, this.getPrivateRoute);
    }

}

const privateRoutes = new PrivateRoute();
privateRoutes.routes();

export default privateRoutes.router;