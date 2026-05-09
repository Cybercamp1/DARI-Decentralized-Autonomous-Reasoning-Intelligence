const { spawn } = require('child_process');
const path = require('path');

function startProcess(name, command, args, cwd) {
  const process = spawn(command, args, { cwd, shell: true });

  process.stdout.on('data', (data) => {
    console.log(`[${name}] ${data.toString().trim()}`);
  });

  process.stderr.on('data', (data) => {
    console.error(`[${name} ERROR] ${data.toString().trim()}`);
  });

  return process;
}

console.log('--- STARTING DARIDAO AUTONOMOUS CIVILIZATION ---');

const backend = startProcess('BACKEND', 'node', ['server.js'], path.join(__dirname, 'backend'));
const frontend = startProcess('FRONTEND', 'npm', ['run', 'dev'], path.join(__dirname, 'frontend'));

process.on('SIGINT', () => {
  backend.kill();
  frontend.kill();
  process.exit();
});
