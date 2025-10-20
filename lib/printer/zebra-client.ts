/**
 * Zebra ZD421 Printer Integration
 * Handles label printing for food safety inspections via Browser Print
 */

export interface InspectionLabelData {
  formName: string;
  submittedBy: string;
  date: string;
  time: string;
  status: 'PASS' | 'FAIL';
  reportUrl: string;
  location?: string;
}

export interface TemperatureLabelData {
  equipment: string;
  temperature: number;
  unit: 'F' | 'C';
  time: string;
  inspector: string;
  location?: string;
}

export class ZebraPrintClient {
  private static instance: ZebraPrintClient;
  private selectedDevice: any = null;

  private constructor() {}

  static getInstance(): ZebraPrintClient {
    if (!ZebraPrintClient.instance) {
      ZebraPrintClient.instance = new ZebraPrintClient();
    }
    return ZebraPrintClient.instance;
  }

  /**
   * Check if Zebra Browser Print is installed and running
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch('http://localhost:9100/available', {
        method: 'GET',
      });
      
      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.printer && data.printer.length > 0;
    } catch (error) {
      console.error('Browser Print not available:', error);
      return false;
    }
  }

  /**
   * Get list of available printers
   */
  async getAvailablePrinters(): Promise<any[]> {
    try {
      const response = await fetch('http://localhost:9100/available', {
        method: 'GET',
      });
      
      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      
      if (data.printer) {
        if (Array.isArray(data.printer)) {
          return data.printer;
        }
        return [data.printer];
      }
      
      return [];
    } catch (error) {
      console.error('Error getting printers:', error);
      return [];
    }
  }

  /**
   * Send raw ZPL to default printer
   */
  async sendZPL(zpl: string): Promise<void> {
    try {
      const printers = await this.getAvailablePrinters();
      
      if (printers.length === 0) {
        throw new Error(
          'No printers found. Please ensure your printer is connected and Browser Print is running.'
        );
      }

      const printer = printers[0];
      console.log('Sending ZPL to:', printer.name);
      console.log('Printer object:', printer);

      // Step 1: Set the device by sending the full printer object
      const setDeviceResponse = await fetch('http://localhost:9100/default', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(printer),
      });

      const setDeviceResult = await setDeviceResponse.text();
      console.log('Set device response:', setDeviceResponse.status, setDeviceResult);

      if (!setDeviceResponse.ok) {
        console.warn('Set device failed:', setDeviceResult);
      }

      // Give it a moment to register
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log('Now sending ZPL to write endpoint...');

      // Step 2: Write ZPL to the device
      const writeResponse = await fetch('http://localhost:9100/write', {
        method: 'POST',
        mode: 'no-cors', // Handle CORS restrictions
        body: zpl,
      });

      console.log('Write response status:', writeResponse.status);
      console.log('Write response type:', writeResponse.type);

      // With no-cors mode, we can't read the response, but status 0 means it was sent
      if (writeResponse.type === 'opaque') {
        console.log('✅ Label sent to printer (opaque response - request was sent)');
      } else {
        const writeResult = await writeResponse.text();
        console.log('Write response:', writeResult);
        
        if (!writeResponse.ok) {
          throw new Error(`Print failed (${writeResponse.status}): ${writeResult}`);
        }
        console.log('✅ Label sent to printer successfully');
      }
    } catch (error) {
      console.error('Print error:', error);
      throw error;
    }
  }

  /**
   * Print inspection label (Pass/Fail)
   */
  async printInspectionLabel(data: InspectionLabelData): Promise<void> {
    const zpl = `
^XA
~TA000
~JSN
^LT0
^MNW
^MTD
^PON
^PMN
^LH0,0
^JMA
^PR6,6
~SD15
^JUS
^LRN
^CI27
^PA0,1,1,0

^FO50,60^A0N,40,40^FD${data.formName}^FS
^FO50,80^GB700,2,2^FS

^FO50,130^A0N,35,35^FDDate: ${data.date} ${data.time}^FS
^FO50,180^A0N,35,35^FDInspector: ${data.submittedBy}^FS

^FO50,260^A0N,60,60^FD${data.status === 'PASS' ? 'STATUS: PASS' : 'STATUS: FAIL'}^FS

^FO50,320^BQN,2,4^FDQA,${data.reportUrl}^FS
^FO300,340^A0N,25,25^FDScan for full report^FS

${data.location ? `^FO50,550^A0N,25,25^FDLocation: ${data.location}^FS` : ''}

^PQ1,0,1,Y
^XZ
    `.trim();

    await this.sendZPL(zpl);
  }

  /**
   * Print temperature log label
   */
  async printTemperatureLabel(data: TemperatureLabelData): Promise<void> {
    const zpl = `
^XA
~TA000
~JSN
^LT0
^MNW
^MTD
^PON
^PMN
^LH0,0
^JMA
^PR6,6
~SD15
^JUS
^LRN
^CI27

^FO50,50^A0N,40,40^FDTEMPERATURE LOG^FS
^FO50,70^GB700,2,2^FS

^FO50,120^A0N,35,35^FD${data.equipment}^FS

^FO50,200^A0N,80,80^FD${data.temperature}${data.unit === 'F' ? '°F' : '°C'}^FS

^FO50,300^A0N,30,30^FDTime: ${data.time}^FS
^FO50,340^A0N,30,30^FDBy: ${data.inspector}^FS

${data.location ? `^FO50,380^A0N,25,25^FD${data.location}^FS` : ''}

^PQ1,0,1,Y
^XZ
    `.trim();

    await this.sendZPL(zpl);
  }

  /**
   * Test print - simple hello world label
   */
  async testPrint(): Promise<void> {
    const zpl = `
^XA
^FO50,50^A0N,50,50^FDTEST PRINT^FS
^FO50,120^A0N,35,35^FDV7 Form Builder^FS
^FO50,170^A0N,30,30^FD${new Date().toLocaleString()}^FS
^FO50,220^A0N,25,25^FDPrinter: Working!^FS
^XZ
    `.trim();

    await this.sendZPL(zpl);
  }
}

// Export singleton instance
export const zebraPrinter = ZebraPrintClient.getInstance();

