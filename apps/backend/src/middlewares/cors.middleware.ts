import { CorsOptions } from "cors";
import { env } from "../utils/env";

export const corsOptions : CorsOptions = {
  origin: env.CLIENT_URL,
  methods: [ "POST","OPTIONS"],
}
