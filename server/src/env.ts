import { z } from 'zod';

// Fail-fast env validation (spine conventions: env vars only, validated at boot).
const envSchema = z.object({
  DATABASE_URL: z.url(),
  OPENAI_API_KEY: z.string().min(1),
  PORT: z.coerce.number().int().positive().default(3000),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment — fix .env (see .env.example):');
  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;
