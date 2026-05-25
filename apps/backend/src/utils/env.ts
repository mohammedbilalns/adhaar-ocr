import * as v from "valibot";

const EnvSchema = v.object({
  PORT: v.pipe(
    v.string(),
    v.transform(Number),
    v.number()
  ),
  CLIENT_URL: v.pipe(
    v.string(),
    v.minLength(1),
  ),
  LOG_LEVEL: v.pipe(
    v.string(),
    v.minLength(1)
  )
});

const result = v.safeParse(EnvSchema, process.env);

if (!result.success) {
  console.error("Invalid environment variables:");

  console.error(v.flatten(result.issues));

  process.exit(1);
}

export const env = result.output;
