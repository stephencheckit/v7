import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  const { formId } = await params;
  
  // Don't load conversations for new forms
  if (formId === 'new' || !formId) {
    return NextResponse.json({ messages: [] });
  }
  
  const { data, error } = await supabase
    .from('ai_conversations')
    .select('messages')
    .eq('form_id', formId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
    console.error('Error loading conversation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ 
    messages: data?.messages || [] 
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  const { formId } = await params;
  const { messages } = await request.json();
  
  // Don't save conversations for new forms
  if (formId === 'new' || !formId) {
    return NextResponse.json({ success: false, reason: 'new_form' });
  }
  
  // Validate messages
  if (!messages || !Array.isArray(messages)) {
    console.error('Invalid messages format:', typeof messages);
    return NextResponse.json({ error: 'Messages must be an array' }, { status: 400 });
  }
  
  // Helper function to remove invalid UTF-8 sequences that PostgreSQL JSONB rejects
  const cleanInvalidUTF8 = (str: string): string => {
    // Remove null bytes
    str = str.replace(/\u0000/g, '');
    
    // Remove invalid UTF-8 surrogate characters (U+D800 to U+DFFF)
    // These are invalid in UTF-8 and cause PostgreSQL JSONB to reject the data
    str = str.replace(/[\uD800-\uDFFF]/g, '');
    
    // Optionally replace with a safe character if you want to preserve length
    // str = str.replace(/[\uD800-\uDFFF]/g, '?');
    
    return str;
  };
  
  // Clean messages for storage - be extremely strict about data types
  // Remove any problematic characters that might cause JSONB issues
  const cleanedMessages = messages.map(msg => {
    const cleaned: any = {
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: cleanInvalidUTF8(String(msg.content || ''))
    };
    
    // Only add optional fields if they have valid values
    if (msg.displayContent && typeof msg.displayContent === 'string') {
      cleaned.displayContent = cleanInvalidUTF8(String(msg.displayContent));
    }
    if (msg.thinking && Array.isArray(msg.thinking)) {
      // Extra cleaning for thinking array
      cleaned.thinking = msg.thinking
        .filter((t: any) => t != null && String(t).trim().length > 0)
        .map((t: any) => cleanInvalidUTF8(String(t)).trim());
    }
    if (msg.completed === true || msg.completed === false) {
      cleaned.completed = Boolean(msg.completed);
    }
    if (msg.mode && (msg.mode === 'strategy' || msg.mode === 'execution')) {
      cleaned.mode = String(msg.mode);
    }
    
    return cleaned;
  });
  
  console.log(`[API] Saving ${cleanedMessages.length} messages for form ${formId}`);
  console.log(`[API] First message preview:`, cleanedMessages[0] ? JSON.stringify(cleanedMessages[0]).substring(0, 200) : 'No messages');
  
  // Don't save empty conversations
  if (cleanedMessages.length === 0) {
    console.log('[API] Skipping save - no messages');
    return NextResponse.json({ success: true, skipped: true });
  }
  
  // Validate that messages can be serialized to valid JSON
  let serializedMessages: string;
  try {
    serializedMessages = JSON.stringify(cleanedMessages);
    console.log(`[API] Messages serialized successfully, length: ${serializedMessages.length}`);
    console.log(`[API] Sample of serialized data:`, serializedMessages.substring(0, 300));
    
    // Double-check by parsing it back
    const reparsed = JSON.parse(serializedMessages);
    console.log(`[API] Messages re-parsed successfully, count: ${reparsed.length}`);
  } catch (jsonError: any) {
    console.error('[API] Messages cannot be serialized:', jsonError.message);
    console.error('[API] Problematic messages:', JSON.stringify(cleanedMessages, null, 2).substring(0, 1000));
    return NextResponse.json({ error: 'Messages contain non-serializable data' }, { status: 400 });
  }
  
  // Try a simple test first to verify the table works
  if (cleanedMessages.length === 1 && cleanedMessages[0].role === 'user') {
    console.log('[API] Testing with simple message first...');
    const testResult = await supabase
      .from('ai_conversations')
      .upsert({
        form_id: `test_${formId}`,
        messages: [{ role: 'user', content: 'test' }],
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'form_id'
      });
    
    if (testResult.error) {
      console.error('[API] Test insert also failed:', testResult.error);
    } else {
      console.log('[API] Test insert succeeded! Issue is with the actual messages.');
    }
  }
  
  // Upsert: update if exists, insert if not
  console.log(`[API] Attempting to upsert conversation for form ${formId}`);
  console.log(`[API] Data to upsert:`, {
    form_id: formId,
    messages_count: cleanedMessages.length,
    messages_sample: JSON.stringify(cleanedMessages[0] || {}).substring(0, 200)
  });
  
  const { data, error } = await supabase
    .from('ai_conversations')
    .upsert({
      form_id: formId,
      messages: cleanedMessages,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'form_id'
    })
    .select();

  if (error) {
    console.error('[API] Error saving conversation:', error);
    console.error('[API] Error code:', error.code);
    console.error('[API] Error message:', error.message);
    console.error('[API] Error details:', error.details);
    console.error('[API] Error hint:', error.hint);
    console.error('[API] Full error object:', JSON.stringify(error, null, 2));
    
    // Try to provide more specific error message
    if (error.code === 'PGRST102') {
      console.error('[API] PGRST102 = JSON parsing error. The JSONB column rejected the data.');
      console.error('[API] This usually means invalid UTF-8 or malformed JSON structure.');
      console.error('[API] Dumping full messages array for inspection:');
      console.error(JSON.stringify(cleanedMessages, null, 2));
    }
    
    return NextResponse.json({ error: error.message || 'Failed to save' }, { status: 500 });
  }

  console.log(`[API] Successfully saved conversation for form ${formId}`);
  return NextResponse.json({ success: true });
}

