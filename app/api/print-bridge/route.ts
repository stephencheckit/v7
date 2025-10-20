import { NextRequest, NextResponse } from 'next/server';

// Configure function timeout for print job polling
export const maxDuration = 60; // Needs longer timeout for print job waiting

// In-memory job queue (in production, use Redis or database)
const printQueue: Map<string, {
  id: string;
  zpl: string;
  status: 'pending' | 'printing' | 'completed' | 'failed';
  result?: any;
  createdAt: number;
}> = new Map();

// Connected bridges (API key -> last seen timestamp)
const connectedBridges: Map<string, number> = new Map();

/**
 * GET /api/print-bridge?apiKey=xxx
 * Bridge polls this endpoint to get pending print jobs
 */
export async function GET(req: NextRequest) {
  const apiKey = req.nextUrl.searchParams.get('apiKey');
  
  if (!apiKey) {
    return NextResponse.json({ error: 'API key required' }, { status: 401 });
  }

  // Update last seen timestamp
  connectedBridges.set(apiKey, Date.now());

  // Find pending jobs for this bridge
  const pendingJobs = Array.from(printQueue.values())
    .filter(job => job.status === 'pending')
    .slice(0, 1); // Get one job at a time

  if (pendingJobs.length > 0) {
    const job = pendingJobs[0];
    job.status = 'printing';
    
    return NextResponse.json({
      hasJob: true,
      job: {
        id: job.id,
        zpl: job.zpl,
      },
    });
  }

  return NextResponse.json({ hasJob: false });
}

/**
 * POST /api/print-bridge
 * Submit a new print job or update job status
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Case 1: Submitting a new print job (from web app)
    if (body.action === 'submit') {
      const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      printQueue.set(jobId, {
        id: jobId,
        zpl: body.zpl,
        status: 'pending',
        createdAt: Date.now(),
      });

      console.log(`[Print Bridge] New job queued: ${jobId}`);

      // Wait for job completion (with timeout)
      const result = await waitForJobCompletion(jobId, 30000); // 30 second timeout
      
      return NextResponse.json(result);
    }

    // Case 2: Bridge reporting job result
    if (body.action === 'result') {
      const { jobId, success, error } = body;
      const job = printQueue.get(jobId);

      if (job) {
        job.status = success ? 'completed' : 'failed';
        job.result = { success, error };
        console.log(`[Print Bridge] Job ${jobId}: ${success ? 'success' : 'failed'}`);
      }

      return NextResponse.json({ success: true });
    }

    // Case 3: Bridge heartbeat/status
    if (body.action === 'heartbeat') {
      const { apiKey, printerName, ready } = body;
      connectedBridges.set(apiKey, Date.now());
      
      return NextResponse.json({
        success: true,
        bridgesConnected: connectedBridges.size,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('[Print Bridge] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Wait for a print job to complete
 */
async function waitForJobCompletion(jobId: string, timeout: number): Promise<any> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const job = printQueue.get(jobId);
    
    if (!job) {
      return { success: false, error: 'Job not found' };
    }

    if (job.status === 'completed') {
      printQueue.delete(jobId); // Clean up
      return { success: true, message: 'Label printed successfully' };
    }

    if (job.status === 'failed') {
      const error = job.result?.error || 'Print failed';
      printQueue.delete(jobId); // Clean up
      return { success: false, error };
    }

    // Wait 500ms before checking again
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Timeout
  printQueue.delete(jobId);
  return { success: false, error: 'Print timeout - bridge may be offline' };
}

/**
 * GET /api/print-bridge/status
 * Check bridge connection status
 */
export async function OPTIONS(req: NextRequest) {
  const TIMEOUT = 60000; // 60 seconds
  const now = Date.now();
  
  // Clean up old bridges
  for (const [apiKey, lastSeen] of connectedBridges.entries()) {
    if (now - lastSeen > TIMEOUT) {
      connectedBridges.delete(apiKey);
    }
  }

  return NextResponse.json({
    bridgesConnected: connectedBridges.size,
    bridges: Array.from(connectedBridges.entries()).map(([apiKey, lastSeen]) => ({
      apiKey: apiKey.substring(0, 8) + '...',
      lastSeen: new Date(lastSeen).toISOString(),
      online: (now - lastSeen) < TIMEOUT,
    })),
  });
}

