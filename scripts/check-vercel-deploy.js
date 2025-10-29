#!/usr/bin/env node

/**
 * Check latest Vercel deployment status and show build errors
 * Formatted for Cursor/VS Code problem matcher
 */

const https = require('https');
const { execSync } = require('child_process');

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
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

    // Get latest deployments
    const deploymentsData = await makeRequest(`/v6/deployments?projectId=${PROJECT_NAME}&limit=1`);
    
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
        
        // Parse logs for TypeScript errors and format for problem matcher
        const lines = logs.split('\n');
        let inError = false;
        let errorFile = '';
        
        for (const line of lines) {
          // Match TypeScript errors like: app/api/workflows/[id]/route.ts:74:13
          const tsErrorMatch = line.match(/^(.+\.tsx?):(\d+):(\d+)/);
          if (tsErrorMatch) {
            errorFile = tsErrorMatch[1];
            console.log(`\n${errorFile}:${tsErrorMatch[2]}:${tsErrorMatch[3]}`);
            inError = true;
            continue;
          }
          
          // Match "Type error:" messages
          if (line.includes('Type error:') || line.includes('Failed to compile')) {
            console.log(line);
            inError = true;
            continue;
          }
          
          // Print error context
          if (inError && line.trim()) {
            console.log(line);
            if (line.includes('Error:') || line.includes('exited with')) {
              inError = false;
            }
          }
        }
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

