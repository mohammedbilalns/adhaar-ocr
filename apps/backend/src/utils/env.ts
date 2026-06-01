const parsedPort = Number(process.env.PORT ?? "3000");

if (!Number.isFinite(parsedPort) || parsedPort <= 0) {
  console.error("Invalid PORT environment variable");
  process.exit(1);
}

export const env = {
  PORT: parsedPort,
  CLIENT_URL: process.env.CLIENT_URL?.trim() || "*",
  LOG_LEVEL: process.env.LOG_LEVEL?.trim() || "info",
};
