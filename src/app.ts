import Koa from 'koa';
import { router } from './router';
import dotenv from 'dotenv';

dotenv.config();

const app = new Koa();

app.use(router.routes());

app.listen(parseInt(process.env.SERVER_PORT as string), process.env.SERVER_IP);
