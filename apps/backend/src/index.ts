import express from "express";
import cors from "cors";
import morgan from "morgan";
import { env } from "./utils/env";
import { ocrRouter } from "./routes/ocr";
import { errorHandler } from "./middlewares/error-handler";
import { logger } from "./utils/logger";
import { HttpStatus } from "./constants";

process.on("uncaughtException", (error) => {
  logger.fatal({ err: error }, "Uncaught Exception");
  process.exit(1);
});

const app = express();

app.use(morgan("dev"));

app.use(
  cors({
    origin: env.CLIENT_URL,
  })
);

app.use(express.json());

app.get("/test", (_req, res) => {
  res.json({ message: "Running..." });
});

app.use("/ocr", ocrRouter);

app.use((req, res) => {
  res.status(HttpStatus.NOT_FOUND).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});
app.use(errorHandler);

const server = app.listen(env.PORT, () => {
  logger.info(`Server is running on port ${env.PORT}`);
});

process.on("unhandledRejection", (reason) => {
  logger.fatal({ err: reason }, "Unhandled Rejection");
  shutdown();
});

function shutdown() {
  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(1);
  });

  setTimeout(() => {
    logger.error("Forced shutdown");
    process.exit(1);
  }, 10000);
}
