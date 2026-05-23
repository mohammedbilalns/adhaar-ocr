import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './utils/env';
import { ocrRouter } from './routes/ocr';
import { errorHandler } from './middlewares/error-handler';

const app = express();

app.use(morgan('dev'));

app.use(cors({
  origin: env.CLIENT_URL,
}));
app.use(express.json())

app.get("/test", (_req, res) => {
  res.json({message:"Running..."})
})

app.use('/ocr', ocrRouter)
app.use(errorHandler)

app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
})
