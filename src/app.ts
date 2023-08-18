import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import fileRoutes from './routes/fileRoutes';
import accessRoutes from './routes/accessRoutes';
import fileFilterRoutes from './routes/fileFilterRoutes';

const app: Express = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/auth', authRoutes);
app.use('/file', fileRoutes);
app.use('/access', accessRoutes);
app.use('/filter', fileFilterRoutes);

app.use('*', (req: Request, res: Response) => {
  return res.status(404).json({
    success: false,
    message: 'Invalid route',
  });
});

export default app;
