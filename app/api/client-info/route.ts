import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/client-info
 * Captures client IP address and user agent for CFR compliance
 * Used by signature widget to create audit trails
 */
export async function GET(req: NextRequest) {
  try {
    // Extract IP address from various headers (Vercel/proxy compatible)
    const ip = 
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
      req.headers.get('x-real-ip') || 
      'unknown';
    
    // Get user agent
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    // Determine device type from user agent
    const ua = userAgent.toLowerCase();
    let deviceType = 'desktop';
    if (ua.includes('mobile')) {
      deviceType = 'mobile';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      deviceType = 'tablet';
    }
    
    return NextResponse.json({ 
      ip, 
      userAgent,
      deviceType,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error capturing client info:', error);
    return NextResponse.json(
      { 
        ip: 'unknown', 
        userAgent: 'unknown',
        deviceType: 'unknown',
        error: error.message 
      },
      { status: 200 } // Still return 200 to not block signature flow
    );
  }
}

