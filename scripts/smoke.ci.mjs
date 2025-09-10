#!/usr/bin/env node

import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Theme configurations
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

const processes = [];
const results = [];

console.log('🔧 Starting smoke test for all calculator themes...');

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetch(url, options = {}) {
  const { default: fetch } = await import('node-fetch');
  return fetch(url, options);
}

async function startThemeServer(theme) {
  return new Promise((resolve, reject) => {
    console.log(`🚀 Starting ${theme.id} theme on port ${theme.port}...`);
    
    const process = spawn('npm', ['run', 'dev'], {
      cwd: join(rootDir, `apps/calculator-${theme.id}`),
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    processes.push(process);
    
    let started = false;
    
    process.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Local:') && !started) {
        started = true;
        console.log(`✅ ${theme.id} theme started on port ${theme.port}`);
        resolve(process);
      }
    });
    
    process.stderr.on('data', (data) => {
      console.error(`❌ ${theme.id} error:`, data.toString());
    });
    
    process.on('error', (error) => {
      console.error(`❌ Failed to start ${theme.id}:`, error);
      reject(error);
    });
    
    // Timeout after 30 seconds
    setTimeout(() => {
      if (!started) {
        console.error(`❌ ${theme.id} failed to start within 30 seconds`);
        reject(new Error(`Timeout starting ${theme.id}`));
      }
    }, 30000);
  });
}

async function testThemeHealth(theme) {
  try {
    const healthUrl = \`http://localhost:\${theme.port}/\`;
    console.log(\`🏥 Testing health endpoint for \${theme.id}...\`);
    
    const response = await fetch(healthUrl);
    
    if (response.ok) {
      console.log(\`✅ \${theme.id} health check passed\`);
      return { theme: theme.id, health: 'passed' };
    } else {
      console.log(\`❌ \${theme.id} health check failed: \${response.status}\`);
      return { theme: theme.id, health: 'failed', error: \`HTTP \${response.status}\` };
    }
  } catch (error) {
    console.log(\`❌ \${theme.id} health check error: \${error.message}\`);
    return { theme: theme.id, health: 'error', error: error.message };
  }
}

async function testQuoteEndpoint(theme) {
  try {
    const apiUrl = \`http://localhost:5000/api/embed/portrait-demo-embed-001/lead\`;
    console.log(\`📄 Testing quote endpoint for \${theme.id}...\`);
    
    const testPayload = {
      name: \`Test User \${theme.id}\`,
      email: \`test-\${theme.id}@example.com\`,
      phone: '1234567890',
      quoteData: {
        total: 150,
        breakdown: ['Base: €100', 'Duration: €50'],
        currencySymbol: '€'
      },
      estimatedValue: '150'
    };
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.lead) {
        console.log(\`✅ \${theme.id} quote endpoint passed\`);
        return { theme: theme.id, quote: 'passed', leadId: data.lead.id };
      } else {
        console.log(\`❌ \${theme.id} quote endpoint failed: Invalid response format\`);
        return { theme: theme.id, quote: 'failed', error: 'Invalid response format' };
      }
    } else {
      const errorText = await response.text();
      console.log(\`❌ \${theme.id} quote endpoint failed: \${response.status} - \${errorText}\`);
      return { theme: theme.id, quote: 'failed', error: \`HTTP \${response.status}\` };
    }
  } catch (error) {
    console.log(\`❌ \${theme.id} quote endpoint error: \${error.message}\`);
    return { theme: theme.id, quote: 'error', error: error.message };
  }
}

async function cleanup() {
  console.log('🧹 Cleaning up processes...');
  processes.forEach(process => {
    try {
      process.kill('SIGTERM');
    } catch (error) {
      console.log('Process already terminated');
    }
  });
}

async function runSmokeTest() {
  try {
    // Start all theme servers
    console.log('📡 Starting all theme servers...');
    for (const theme of themes) {
      try {
        await startThemeServer(theme);
        await wait(2000); // Wait 2 seconds between starts
      } catch (error) {
        console.error(\`Failed to start \${theme.id}:\`, error.message);
        results.push({ theme: theme.id, health: 'failed', error: 'Failed to start' });
      }
    }
    
    // Wait for all servers to settle
    await wait(5000);
    
    // Test health endpoints
    console.log('🏥 Testing health endpoints...');
    for (const theme of themes) {
      const healthResult = await testThemeHealth(theme);
      results.push(healthResult);
    }
    
    // Test quote endpoints (same backend for all)
    console.log('📄 Testing quote endpoints...');
    for (const theme of themes) {
      const quoteResult = await testQuoteEndpoint(theme);
      const existingResult = results.find(r => r.theme === theme.id);
      if (existingResult) {
        Object.assign(existingResult, quoteResult);
      } else {
        results.push(quoteResult);
      }
    }
    
    // Generate report
    console.log('\\n📊 SMOKE TEST REPORT');
    console.log('='.repeat(50));
    
    let passed = 0;
    let failed = 0;
    
    results.forEach(result => {
      const status = (result.health === 'passed' && result.quote === 'passed') ? '✅' : '❌';
      console.log(\`\${status} \${result.theme}: Health=\${result.health}, Quote=\${result.quote}\`);
      
      if (result.health === 'passed' && result.quote === 'passed') {
        passed++;
      } else {
        failed++;
        if (result.error) console.log(\`   Error: \${result.error}\`);
      }
    });
    
    console.log('\\n📈 SUMMARY');
    console.log(\`✅ Passed: \${passed}/\${themes.length}\`);
    console.log(\`❌ Failed: \${failed}/\${themes.length}\`);
    
    if (failed === 0) {
      console.log('\\n🎉 All smoke tests passed!');
      process.exit(0);
    } else {
      console.log('\\n⚠️  Some smoke tests failed!');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 Smoke test crashed:', error);
    process.exit(1);
  } finally {
    cleanup();
  }
}

// Handle cleanup on exit
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

runSmokeTest();