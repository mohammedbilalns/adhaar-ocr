import pino from "pino";
import { env } from "./env";


export const logger = pino({
  level: env.LOG_LEVEL || "info",

  base: {
    env: env.LOG_LEVEL,
  },

  timestamp: pino.stdTimeFunctions.isoTime,

  formatters: {
    level: (label) => ({
      level: label.toUpperCase(),
    }),
  },

  transport: env.LOG_LEVEL === "debug" 
    ? {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
        singleLine: false,
        levelFirst: true,
      },
    }
    : undefined,

  serializers: {
    err: pino.stdSerializers.err,
  },
};
