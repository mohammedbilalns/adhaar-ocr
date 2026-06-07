import express, { type Application } from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import { logger } from "./utils/logger";
import { ocrRouter } from "./routes/ocr";
import { errorHandler } from "./middlewares/error-handler";
import { HttpStatus } from "./constants";
import { Server } from "node:http";
import { corsOptions } from "./middlewares/cors.middleware";

class App {
  private _app : Application
  private _server: Server | null = null

  constructor(){
    this._app = express()
    this._setupMiddlewares()
    this._setupRoutes()
    this._setupErrorHandler()
  }

  private _setupMiddlewares(){
    this._app
      .use(helmet())
      .use(morgan("dev"))
      .use(cors(corsOptions))
      .use(express.json());
  }
  private _setupRoutes(){

    this._app.get("/test", (_req, res) => {
      res.json({ message: "Running..." });
    });

    this._app.use("/ocr", ocrRouter);

    this._app.use((req, res) => {
      res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`,
      });
    });

  }
  private _setupErrorHandler(){

    this._app.use(errorHandler)

  }

  public listen(port: number){
    this._server = this._app.listen(port , () => {
      logger.info(`Server is running on port ${port}`)
    })
  }

  public get server(){
    return this._server
  }

}

export default App
