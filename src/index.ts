import swagger from '@elysiajs/swagger';
import { Elysia, error, t } from 'elysia';
import { userPanel } from './auth/auth';
import { movie } from './movie/movie';
import { ticket } from './tickets/ticket';
import { cinema } from './cinema/cinema';
import cors from '@elysiajs/cors';
import { wallets } from './wallet/wallet';
import { role } from './roles/role';

const app = new Elysia()
  .use(
    cors({
      origin: '*',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  )
  .use(swagger())
  .use(userPanel)
  .use(movie)
  .use(ticket)
  .use(cinema)
  .use(wallets)
  .use(role)

  .listen(3100);
