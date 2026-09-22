#!/usr/bin/env node
import { spawn } from 'node:child_process';

function run(cmd, args) {
  const child = spawn(cmd, args, { stdio: 'inherit' });
  child.on('exit', (code) => {
    if (code && code !== 0) process.exit(code);
  });
  return child;
}

const api = run(process.execPath, ['scripts/api-dev.mjs']);
const web = run('npx', ['astro', 'dev', '--host', '127.0.0.1', '--port', '4322']);

function shutdown() {
  api.kill();
  web.kill();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
