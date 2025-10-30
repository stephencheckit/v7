#!/usr/bin/env node

/**
 * Check latest Vercel deployment status and show build errors
 * Formatted for Cursor/VS Code problem matcher
 */

const https = require('https');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load VERCEL_TOKEN from .env.local if not in environment
let VERCEL_TOKEN = process.env.VERCEL_TOKEN;

if (!VERCEL_TOKEN) {
  try {
    const envPath = path.join(__dirname, '..', '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const tokenMatch = envContent.match(/VERCEL_TOKEN=(.+)/);
      if (tokenMatch) {
        VERCEL_TOKEN = tokenMatch[1].trim();
      }
    }
  } catch (e) {
    // Ignore - will fallback to CLI
  }
}
const PROJECT_NAME = 'v7'; // Update this to match your Vercel project name

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.vercel.com',
      path: path,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
      },
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  if (!VERCEL_TOKEN) {
    console.log('\n⚠️  VERCEL_TOKEN not set in environment variables');
    console.log('To enable Vercel integration:');
    console.log('1. Get token from: https://vercel.com/account/tokens');
    console.log('2. Add to .env.local: VERCEL_TOKEN=your_token_here\n');

    // Fallback to CLI if available
    try {
      console.log('Trying Vercel CLI instead...\n');
      const output = execSync('npx vercel ls', { encoding: 'utf-8' });
      console.log(output);
    } catch (e) {
      console.log('Vercel CLI not available or not logged in');
      console.log('Run: npx vercel login');
    }
    return;
  }

  try {
    console.log('🔍 Checking latest Vercel deployment...\n');

    // Get project ID first (we need the actual ID, not the name)
    const projectsData = await makeRequest('/v9/projects');
    const project = projectsData.projects?.find(p => p.name === PROJECT_NAME);
    
    if (!project) {
      console.log(`❌ Project "${PROJECT_NAME}" not found`);
      console.log('Available projects:', projectsData.projects?.map(p => p.name).join(', '));
      return;
    }

    // Get latest deployments using project ID
    const deploymentsData = await makeRequest(`/v6/deployments?projectId=${project.id}&limit=1`);

    if (!deploymentsData.deployments || deploymentsData.deployments.length === 0) {
      console.log('No deployments found');
      return;
    }

    const deployment = deploymentsData.deployments[0];
    const status = deployment.state;
    const url = `https://${deployment.url}`;
    const createdAt = new Date(deployment.created).toLocaleString();

    console.log(`📦 Latest Deployment:`);
    console.log(`   Status: ${status === 'READY' ? '✅ READY' : status === 'ERROR' ? '❌ ERROR' : '⏳ ' + status}`);
    console.log(`   URL: ${url}`);
    console.log(`   Created: ${createdAt}`);
    console.log(`   Commit: ${deployment.meta?.githubCommitMessage || 'N/A'}`);

    // If deployment failed, try to get build logs
    if (status === 'ERROR' || status === 'FAILED') {
      console.log('\n📋 Fetching build logs...\n');

      try {
        // Get build logs - note: this endpoint might require different permissions
        const logs = execSync(`npx vercel logs ${deployment.url} --output raw`, {
          encoding: 'utf-8',
          stdio: 'pipe'
        });

        // Parse logs for TypeScript errors and format for Cursor problem matcher
        const lines = logs.split('\n');
        let currentFile = '';
        let currentLine = '';
        let currentCol = '';
        let currentError = '';

        for (const line of lines) {
          // Match TypeScript errors: ./app/api/workflows/[id]/route.ts:74:13
          const tsErrorMatch = line.match(/^\.?\/(.+\.tsx?):(\d+):(\d+)/);
          if (tsErrorMatch) {
            currentFile = tsErrorMatch[1];
            currentLine = tsErrorMatch[2];
            currentCol = tsErrorMatch[3];
            continue;
          }

          // Match "Type error:" messages
          const typeErrorMatch = line.match(/Type error:\s*(.+)$/);
          if (typeErrorMatch && currentFile) {
            currentError = typeErrorMatch[1];
            // Output in standard format: file:line:column: error: message
            console.log(`${currentFile}:${currentLine}:${currentCol}: error: ${currentError}`);
            currentFile = '';
            continue;
          }

          // Match other error patterns
          if (line.includes('Failed to compile') || line.includes('Build failed')) {
            console.log(`\n❌ ${line}\n`);
          }
        }

        console.log('\n💡 Errors above should appear in Cursor Problems panel');
        console.log(`📊 View full logs: https://vercel.com/dashboard/deployments/${deployment.uid}`);
      } catch (logError) {
        console.log('Could not fetch detailed logs. Check Vercel dashboard:');
        console.log(`https://vercel.com/dashboard/deployments/${deployment.uid}`);
      }
    } else if (status === 'READY') {
      console.log('\n✅ Deployment successful!');
    } else {
      console.log('\n⏳ Deployment in progress...');
    }

  } catch (error) {
    console.error('Error checking Vercel deployment:', error.message);
    console.log('\nFalling back to Vercel CLI...');
    try {
      const output = execSync('npx vercel ls', { encoding: 'utf-8' });
      console.log(output);
    } catch (e) {
      console.log('Could not fetch deployment info');
    }
  }
}

main().catch(console.error);

