import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Charge les variables d'environnement
config({ path: '.env' });

// Vérifiez si la variable d'environnement est bien lue
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in the .env file');
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
