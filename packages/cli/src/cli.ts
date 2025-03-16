#!/usr/bin/env node

import { Command } from 'commander';
import { serve } from '@hono/node-server';
import fs from 'node:fs';
import path from 'node:path';
import createServer, { ServerOptions } from './server';

type Options = {
  tenant: string;
  secret: string;
  client: string;
  port: number;
  config: string;
  scopes: string;
  proxy: string;
};

const program = new Command();
program
  .version('1.0.0')
  .description('Local token handler service')
  .option('-t, --tenant <value>', 'Specify tenant id')
  .option('-s, --secret <value>', 'Specify client secret')
  .option('-i, --client <value>', 'Specify client id')
  .option('-p, --port <value>', 'Specify port')
  .option('-S, --scopes <value>', 'Specify scopes')
  .option('--proxy <value>', 'Proxy URL')
  .option('-c, --config <value>', 'Config file')
  .showHelpAfterError()
  .parse(process.argv);

const options = program.opts<Options>();
const config = getConfig(options);
if (!config.tenantId || !config.clientSecret || !config.clientId) {
  console.error('Missing required options; clientId, clientSecret and/or tenantId');
  program.help();
  process.exit(1);
}

const app = createServer(config);
console.log(`\nStarting server on http://localhost:${config.port}`);
serve({
  fetch: app.fetch,
  port: config.port,
});

function getConfig(opts: Options): ServerOptions {
  let config = {} as any;
  if (opts.config) {
    const configFile = path.join(process.cwd(), opts.config);
    if (!fs.existsSync(configFile)) {
      throw new Error(`Config file ${configFile} not found`);
    }

    // read from file
    const content = fs.readFileSync(configFile, 'utf8');
    config = JSON.parse(content) as ServerOptions;
  }

  // overwrite config with cli options
  // if available
  if (opts.tenant) {
    config.tenantId = opts.tenant;
  }
  if (opts.secret) {
    config.clientSecret = opts.secret;
  }
  if (opts.client) {
    config.clientId = opts.client;
  }
  if (opts.port) {
    config.port = opts.port;
  }
  if (opts.scopes) {
    config.scopes = opts.scopes.split(',');
  }

  if (opts.proxy) {
    config.proxy = opts.proxy;
  }

  if (!config.port) {
    config.port = 3000;
  }

  return config as ServerOptions;
}
