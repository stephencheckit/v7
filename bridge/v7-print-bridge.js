#!/usr/bin/env node

/**
 * V7 Print Bridge
 * Connects your local Zebra printer to the V7 cloud platform
 * 
 * Installation:
 *   npm install ws
 *   node v7-print-bridge.js
 * 
 * Or standalone:
 *   npx v7-print-bridge
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const https = require('https');
const http = require('http');

const execAsync = promisify(exec);

// Configuration
const API_URL = process.env.V7_API_URL || 'http://localhost:3000';
const API_KEY = process.env.V7_API_KEY || 'demo';
const POLL_INTERVAL = 2000; // Poll every 2 seconds

class V7PrintBridge {
  constructor() {
    this.printerName = null;
    this.isRunning = false;
    this.pollTimer = null;
  }

  async makeRequest(method, path, body = null) {
    const url = `${API_URL}${path}`;
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;

    return new Promise((resolve, reject) => {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const req = client.request(url, options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve({ success: false, error: 'Invalid response' });
          }
        });
      });

      req.on('error', reject);

      if (body) {
        req.write(JSON.stringify(body));
      }

      req.end();
    });
  }

  async detectPrinter() {
    try {
      console.log('🔍 Detecting Zebra printer...');
      const { stdout } = await execAsync('lpstat -p | grep -i zebra');
      
      if (!stdout) {
        console.warn('⚠️  No Zebra printer found. Please ensure your printer is connected.');
        return null;
      }

      // Extract printer name from lpstat output
      const match = stdout.match(/printer\s+(\S+)/);
      if (match) {
        this.printerName = match[1];
        console.log(`✅ Found printer: ${this.printerName}`);
        return this.printerName;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error detecting printer:', error.message);
      return null;
    }
  }

  async printLabel(zpl) {
    if (!this.printerName) {
      throw new Error('No printer configured');
    }

    try {
      console.log('🖨️  Printing label...');
      
      // Send ZPL to printer using lp command
      const command = `echo '${zpl.replace(/'/g, "'\\''")}' | lp -d ${this.printerName} -o raw`;
      const { stdout, stderr } = await execAsync(command);

      if (stderr && !stderr.includes('request id')) {
        throw new Error(stderr);
      }

      console.log('✅ Label sent to printer');
      return { success: true, output: stdout };
    } catch (error) {
      console.error('❌ Print error:', error.message);
      throw error;
    }
  }

  async pollForJobs() {
    try {
      // Poll for pending print jobs
      const response = await this.makeRequest('GET', `/api/print-bridge?apiKey=${API_KEY}`);

      if (response.hasJob && response.job) {
        const { id, zpl } = response.job;
        console.log(`📄 Received print job: ${id}`);

        try {
          await this.printLabel(zpl);

          // Report success
          await this.makeRequest('POST', '/api/print-bridge', {
            action: 'result',
            jobId: id,
            success: true,
          });
        } catch (error) {
          // Report failure
          await this.makeRequest('POST', '/api/print-bridge', {
            action: 'result',
            jobId: id,
            success: false,
            error: error.message,
          });
        }
      }
    } catch (error) {
      console.error('❌ Poll error:', error.message);
    }

    // Schedule next poll
    if (this.isRunning) {
      this.pollTimer = setTimeout(() => this.pollForJobs(), POLL_INTERVAL);
    }
  }

  async sendHeartbeat() {
    try {
      await this.makeRequest('POST', '/api/print-bridge', {
        action: 'heartbeat',
        apiKey: API_KEY,
        printerName: this.printerName,
        ready: !!this.printerName,
      });
    } catch (error) {
      // Silently fail on heartbeat errors
    }
  }

  async start() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║       V7 Print Bridge v1.0.0          ║');
    console.log('╚════════════════════════════════════════╝\n');
    
    console.log(`🔌 Connecting to V7 cloud: ${API_URL}`);
    
    // Detect printer
    await this.detectPrinter();
    
    if (!this.printerName) {
      console.warn('⚠️  Warning: No printer detected. Waiting for printer...');
    }

    // Send initial heartbeat
    await this.sendHeartbeat();
    console.log('✅ Connected to V7 cloud');
    
    // Start polling
    this.isRunning = true;
    this.pollForJobs();

    // Send heartbeat every 30 seconds
    setInterval(() => this.sendHeartbeat(), 30000);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n👋 Shutting down...');
      this.isRunning = false;
      if (this.pollTimer) {
        clearTimeout(this.pollTimer);
      }
      process.exit(0);
    });
  }
}

// Start the bridge
const bridge = new V7PrintBridge();
bridge.start();

