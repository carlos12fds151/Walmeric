import { Request, Response, Router } from 'express';
import jwtAuth from '../../middlewares/jwt';
import { get, set, del } from '../../middlewares/redis/index';

class PublicRoute {

    router: Router;

    constructor(){
        this.router = Router();
        this.routes();
    }

    generateToken(req: Request, res: Response){
        const user = {id: 3};
        const token = jwtAuth.createToken(user, process.env.TOKEN_KEY as string);
        res.json({
            token
        });
    };

    async getPublicRoute(req: Request, res: Response){
       let publicRoute;
       /*
            I create this function to let you delete the key and try with redis again.
            const deleteKey = await del('message');
       */
       const redisGet = JSON.parse(await get('message') as string);
       if(redisGet !== null){
         publicRoute = redisGet;
       }else{
        publicRoute = { message: "[PUBLIC ROUTE] Hola desde fuera de redis" };
        await set('message', JSON.stringify({ message: "[PUBLIC ROUTE] Hola desde Redis" }));
       }
       return res.send(publicRoute);
    }

    routes(){
       this.router.get('/api/public', this.getPublicRoute);
       this.router.get('/api/token', this.generateToken);
    }

}

const publicRoutes = new PublicRoute();
publicRoutes.routes();

export default publicRoutes.router;