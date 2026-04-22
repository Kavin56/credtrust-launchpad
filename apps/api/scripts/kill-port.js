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
  const output = execSync('netstat -ano -p tcp').toString();
  const udpOutput = execSync('netstat -ano -p udp').toString();
  const lines = `${output}\n${udpOutput}`.trim().split('\n');
  const pids = new Set();
  lines.forEach((line) => {
    const parts = line.trim().split(/\s+/);
    const protocol = parts[0];
    const localAddress = parts[1];
    const isTcp = protocol === 'TCP';
    const state = isTcp ? parts[3] : null;
    const pid = isTcp ? parts[4] : parts[3];

    if (!localAddress || !localAddress.endsWith(`:${port}`)) {
      return;
    }

    if (isTcp && state !== 'LISTENING') {
      return;
    }

    if (pid && pid !== '0') {
      pids.add(pid);
    }
  });
  pids.forEach((pid) => {
    try {
      execSync(`taskkill /PID ${pid} /T /F`);
      console.log(`Killed process ${pid} on port ${port}`);
    } catch (err) {
      // ignore failures per pid
    }
  });
} catch (err) {
  // no process found or netstat not available; ignore
}
