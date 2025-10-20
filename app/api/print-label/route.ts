import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const { zpl } = await req.json();

    if (!zpl) {
      return NextResponse.json({ error: 'No ZPL provided' }, { status: 400 });
    }

    console.log('[Print Label] Received ZPL:', zpl.substring(0, 100) + '...');

    // Get the Zebra printer name from system
    const { stdout: printerList } = await execAsync('lpstat -p | grep -i zebra');
    
    if (!printerList) {
      return NextResponse.json({ 
        error: 'No Zebra printer found. Please ensure your ZD421 is connected and configured in System Settings.' 
      }, { status: 404 });
    }

    // Extract printer name (format: "printer PRINTER_NAME is idle...")
    const printerMatch = printerList.match(/printer\s+(\S+)/);
    if (!printerMatch) {
      return NextResponse.json({ 
        error: 'Could not parse printer name' 
      }, { status: 500 });
    }

    const printerName = printerMatch[1];
    console.log('[Print Label] Using printer:', printerName);

    // Send ZPL to printer using lp command
    // The -o raw option ensures ZPL is sent directly without processing
    const command = `echo '${zpl.replace(/'/g, "'\\''")}' | lp -d ${printerName} -o raw`;
    
    const { stdout, stderr } = await execAsync(command);

    if (stderr && !stderr.includes('request id')) {
      console.error('[Print Label] Error:', stderr);
      return NextResponse.json({ 
        error: `Print failed: ${stderr}` 
      }, { status: 500 });
    }

    console.log('[Print Label] Success:', stdout);

    return NextResponse.json({ 
      success: true,
      message: 'Label sent to printer',
      output: stdout
    });

  } catch (error: any) {
    console.error('[Print Label] Error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to print label' 
    }, { status: 500 });
  }
}

