import { parseAndValidateEnv, AppConfig } from './env.js';

let cachedConfig: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (!cachedConfig) {
    cachedConfig = parseAndValidateEnv(process.env);
  }
  return cachedConfig;
}

// Reset helper for testing
export function resetConfigForTest(envSource?: NodeJS.ProcessEnv): AppConfig {
  cachedConfig = parseAndValidateEnv(envSource ?? process.env);
  return cachedConfig;
}

export * from './env.js';
