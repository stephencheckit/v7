import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/auth/verify-password
 * Verifies user password for CFR-compliant signature authentication
 * Body: { password: string }
 * Returns: { verified: boolean, userId?: string, userEmail?: string, userName?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { password } = await req.json();
    
    if (!password) {
      return NextResponse.json(
        { verified: false, error: 'Password is required' },
        { status: 400 }
      );
    }
    
    // Get current authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { verified: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Verify password by attempting to sign in
    // This doesn't change the session, just validates the password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: password
    });
    
    if (signInError) {
      return NextResponse.json({
        verified: false,
        error: 'Invalid password'
      });
    }
    
    // Password is valid - return user info for signature
    return NextResponse.json({
      verified: true,
      userId: user.id,
      userEmail: user.email,
      userName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown User'
    });
    
  } catch (error: any) {
    console.error('Password verification error:', error);
    return NextResponse.json(
      { verified: false, error: 'Verification failed' },
      { status: 500 }
    );
  }
}

