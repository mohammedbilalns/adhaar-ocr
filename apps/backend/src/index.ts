import express from 'express';
import cors from 'cors';
import { env } from './utils/env';
import { ocrRouter } from './routes/ocr';

const app = express();

app.use(cors({
  origin: env.CLIENT_URL,
}));
app.use(express.json())

app.get("/test", (req, res) => {
  res.json({message:"Running..."})
})

app.use('/ocr', ocrRouter)

app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
})
