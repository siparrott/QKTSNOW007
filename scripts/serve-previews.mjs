#!/usr/bin/env node

import { spawn } from 'child_process';
import { readFileSync } from 'fs';

const themes = [
  { id: 'classic', port: 4101 },
  { id: 'minimal', port: 4102 },
  { id: 'modern', port: 4103 },
  { id: 'elegant', port: 4104 },
  { id: 'bold', port: 4105 },
  { id: 'serif', port: 4106 },
  { id: 'rounded', port: 4107 },
  { id: 'mono', port: 4108 },
  { id: 'contrast', port: 4109 },
  { id: 'pastel', port: 4110 },
  { id: 'neon', port: 4111 },
  { id: 'dark', port: 4112 }
];

console.log('🚀 Starting all theme preview servers...');

const processes = [];

themes.forEach(theme => {
  console.log(\`📡 Starting \${theme.id} on port \${theme.port}\`);
  
  const process = spawn('npm', ['run', 'preview'], {
    cwd: \`apps/calculator-\${theme.id}\`,
    stdio: 'inherit'
  });
  
  processes.push(process);
});

console.log('\\n🌐 Preview URLs:');
themes.forEach(theme => {
  console.log(\`\${theme.id}: http://localhost:\${theme.port}\`);
});

console.log('\\nPress Ctrl+C to stop all servers');

process.on('SIGINT', () => {
  console.log('\\n🛑 Stopping all servers...');
  processes.forEach(process => process.kill());
  process.exit(0);
});