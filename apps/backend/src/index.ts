import { logger } from "./utils/logger";
import App from "./app";
import { env } from "./utils/env";

process.on("uncaughtException", (error) => {
  logger.fatal({ err: error }, "Uncaught Exception");
  process.exit(1);
});


const appInstance = new App() 
appInstance.listen(env.PORT)

appInstance.server?.on("error", (err) => {
  logger.fatal(`Failed to start server: ${err} `)
})
appInstance.server?.on("connect", (req, sock, head, )=>{
  logger.info(` Request :  ${req}, Socket : ${sock}, Head : ${head}   `)
})

process.on("unhandledRejection", (reason) => {
  logger.fatal({ err: reason }, "Unhandled Rejection");
  shutdown();
});

function shutdown() {
  if (!appInstance.server) {
    process.exit(1);
  }

  appInstance.server.close(() => {
    logger.info("HTTP server closed");
    process.exit(1);
  });

  setTimeout(() => {
    logger.error("Forced shutdown");
    process.exit(1);
  }, 10000);
}
