import { readFileSync } from 'fs';
import { resolve } from 'path';
import { TokenHandlerConfig, TokenHandlerConfigSchema, DEFAULT_CONFIG } from './types';

/**
 * Loads the configuration from a JSON file or returns default values
 * @param configPath - Optional path to the configuration file
 * @returns The validated configuration object
 */
export function loadConfig(configPath?: string): TokenHandlerConfig {
  const defaultConfigPath = 'tokenhandler.config.json';
  const path = configPath || process.env.TOKEN_HANDLER_CONFIG || defaultConfigPath;

  try {
    const resolvedPath = resolve(process.cwd(), path);
    const fileContent = readFileSync(resolvedPath, 'utf-8');
    const config = JSON.parse(fileContent);

    // Merge with default config to ensure all fields exist
    const mergedConfig = {
      ...DEFAULT_CONFIG,
      ...config,
      oauth: { ...DEFAULT_CONFIG.oauth, ...config.oauth },
      session: { ...DEFAULT_CONFIG.session, ...config.session },
      cors: { ...DEFAULT_CONFIG.cors, ...config.cors },
    };

    // Validate the configuration
    const result = TokenHandlerConfigSchema.safeParse(mergedConfig);

    if (!result.success) {
      console.error('Configuration validation failed:', result.error.message);
      return DEFAULT_CONFIG;
    }

    return result.data;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.error('Error loading configuration:', error);
    }
    return DEFAULT_CONFIG;
  }
}

export * from './types';
