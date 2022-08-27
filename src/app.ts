import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';

import privateRoutes from './privateAcess/routes/index';
import publicRoutes from './publicAcess/routes/index';

import { RateLimiter } from './middlewares/rateLimiter/index';

class App {

    public app: express.Application;

    constructor(){
        this.app = express();
        this.config();
        this.middleware();
        this.routes();
    }

    config(){
        this.app.set('port', process.env.PORT || 3000);
    }

    middleware(){
        this.app.use(cors());
        this.app.use(morgan('dev'));
        this.app.use(RateLimiter);
    }

    routes(){
        this.app.use(privateRoutes);
        this.app.use(publicRoutes);
    }

    start(){
        this.app.listen(this.app.get('port'), () => {
            console.log('🚀 Server is running on port', this.app.get('port'));
        })
    }

}

const server = new App();
server.start();