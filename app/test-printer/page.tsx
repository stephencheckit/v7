'use client';

import { useState, useEffect } from 'react';
import { zebraPrinter } from '@/lib/printer/zebra-client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function TestPrinterPage() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [printers, setPrinters] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    checkPrinter();
  }, []);

  const checkPrinter = async () => {
    setLoading(true);
    setMessage('Checking for Browser Print...');
    
    const available = await zebraPrinter.isAvailable();
    setIsAvailable(available);

    if (available) {
      const printerList = await zebraPrinter.getAvailablePrinters();
      setPrinters(printerList);
      setMessage(`✅ Found ${printerList.length} printer(s)`);
    } else {
      setMessage('❌ Zebra Browser Print not detected. Please install it.');
    }
    
    setLoading(false);
  };

  const handleTestPrint = async () => {
    setLoading(true);
    setMessage('Sending test print...');
    
    try {
      await zebraPrinter.testPrint();
      setMessage('✅ Test label sent to printer!');
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    }
    
    setLoading(false);
  };

  const handleInspectionPrint = async () => {
    setLoading(true);
    setMessage('Printing inspection label...');
    
    try {
      await zebraPrinter.printInspectionLabel({
        formName: 'Kitchen Inspection',
        submittedBy: 'John Doe',
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        status: 'PASS',
        reportUrl: 'https://v7.app/reports/test-123',
        location: 'Main Kitchen'
      });
      setMessage('✅ Inspection label sent!');
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    }
    
    setLoading(false);
  };

  const handleTempPrint = async () => {
    setLoading(true);
    setMessage('Printing temperature label...');
    
    try {
      await zebraPrinter.printTemperatureLabel({
        equipment: 'Walk-in Cooler #1',
        temperature: 38,
        unit: 'F',
        time: new Date().toLocaleTimeString(),
        inspector: 'Jane Smith',
        location: 'Main Kitchen'
      });
      setMessage('✅ Temperature label sent!');
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            🖨️ Zebra Printer Test
          </h1>
          <p className="text-gray-400">Test your ZD421 printer integration</p>
        </div>

        <Card className="p-6 bg-white/5 border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">
            Printer Status
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-gray-300">
                {isAvailable ? 'Browser Print Connected' : 'Browser Print Not Found'}
              </span>
            </div>

            {printers.length > 0 && (
              <div className="text-gray-300">
                <strong className="text-white">Available Printers:</strong>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  {printers.map((printer, i) => (
                    <li key={i} className="text-gray-400">
                      {printer.name}
                      <span className="text-gray-500 text-sm ml-2">
                        ({printer.connection})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-4 bg-white/5 border border-white/10 rounded">
              <p className="text-gray-300">{message}</p>
            </div>

            <Button 
              onClick={checkPrinter} 
              disabled={loading}
              variant="outline"
              className="bg-white/5 hover:bg-white/10"
            >
              🔄 Refresh Status
            </Button>
          </div>
        </Card>

        <Card className="p-6 bg-white/5 border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">
            Test Prints
          </h2>
          
          <div className="space-y-3">
            <Button 
              onClick={handleTestPrint} 
              disabled={loading || !isAvailable}
              className="w-full bg-gradient-to-r from-[#c4dfc4] to-[#b5d0b5] text-black hover:from-[#b5d0b5] hover:to-[#a5c0a5]"
            >
              1️⃣ Test Print (Simple Label)
            </Button>

            <Button 
              onClick={handleInspectionPrint} 
              disabled={loading || !isAvailable}
              className="w-full bg-gradient-to-r from-[#c8e0f5] to-[#b5d5ea] text-black hover:from-[#b5d5ea] hover:to-[#a5c5da]"
            >
              2️⃣ Print Inspection Label (with QR Code)
            </Button>

            <Button 
              onClick={handleTempPrint} 
              disabled={loading || !isAvailable}
              className="w-full bg-gradient-to-r from-[#ddc8f5] to-[#cab5e5] text-black hover:from-[#cab5e5] hover:to-[#b7a5d5]"
            >
              3️⃣ Print Temperature Label
            </Button>
          </div>

          {!isAvailable && (
            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded">
              <p className="text-yellow-300 text-sm">
                <strong>Setup Required:</strong> Zebra Browser Print must be running to print labels.
                <br />
                <a 
                  href="https://www.zebra.com/us/en/support-downloads/software/utilities/browser-print-v2.html"
                  target="_blank"
                  className="underline hover:text-yellow-200"
                >
                  Download Browser Print for Mac →
                </a>
              </p>
            </div>
          )}
        </Card>

        <Card className="p-6 bg-white/5 border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">
            📋 Next Steps
          </h2>
          
          <div className="space-y-3 text-gray-300">
            <div className="flex items-start gap-3">
              <span className="text-green-500">✅</span>
              <div>
                <strong className="text-white">Browser Print installed</strong>
                <p className="text-sm text-gray-400">Running in background, detecting printers</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-green-500">✅</span>
              <div>
                <strong className="text-white">ZD421 connected</strong>
                <p className="text-sm text-gray-400">Ready to print via USB or network</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-blue-500">📝</span>
              <div>
                <strong className="text-white">Integration complete</strong>
                <p className="text-sm text-gray-400">Now you can add print buttons to your forms!</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

