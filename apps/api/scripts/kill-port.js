#!/usr/bin/env node
/**
 * Kill a process that is listening on the given port (Windows)
 */
const { execSync } = require('child_process');

const port = process.argv[2];
if (!port) {
  console.error('Usage: kill-port <port>');
  process.exit(1);
}

try {
  const output = execSync(`netstat -ano | findstr :${port}`).toString();
  const lines = output.trim().split('\n');
  const pids = new Set();
  lines.forEach((line) => {
    const parts = line.trim().split(/\s+/);
    const pid = parts[parts.length - 1];
    if (pid) pids.add(pid);
  });
  pids.forEach((pid) => {
    try {
      execSync(`taskkill /PID ${pid} /F`);
      console.log(`Killed process ${pid} on port ${port}`);
    } catch (err) {
      // ignore failures per pid
    }
  });
} catch (err) {
  // no process found or netstat not available; ignore
}
