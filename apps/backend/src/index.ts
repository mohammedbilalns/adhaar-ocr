import express from 'express';
import cors from 'cors';
import { env } from './utils/env';

const app = express();

app.use(cors({
  origin: env.CLIENT_URL,
}));

app.get("/test", (req, res) => {
  res.json({message:"Running..."})
})


app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
})
