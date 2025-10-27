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

export interface FoodPrepLabelData {
  name: string;
  prepDate: string;
  expirationDate: string;
  ingredients?: string[];
  allergens?: string[];
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
   * Send raw ZPL to printer
   * Tries Browser Print first, falls back to Cloud Bridge
   */
  async sendZPL(zpl: string): Promise<void> {
    try {
      console.log('ZPL preview:', zpl.substring(0, 100) + '...');

      // Try Browser Print first (direct local printing)
      const browserPrintAvailable = await this.isAvailable();
      if (browserPrintAvailable) {
        console.log('Using Browser Print (local)...');
        await this.sendViaBrowserPrint(zpl);
        return;
      }

      // Fall back to Cloud Bridge (for SaaS/multi-client)
      console.log('Browser Print not available, using Cloud Bridge...');
      await this.sendViaCloudBridge(zpl);
    } catch (error) {
      console.error('Print error:', error);
      throw error;
    }
  }

  /**
   * Send via Browser Print (local workstation)
   */
  private async sendViaBrowserPrint(zpl: string): Promise<void> {
    const printers = await this.getAvailablePrinters();
    if (printers.length === 0) {
      throw new Error('No printer found');
    }

    const printer = printers[0];
    console.log('Using printer:', printer.name);

    const response = await fetch('http://localhost:9100/write', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ device: printer, data: zpl }),
    });

    if (!response.ok) {
      throw new Error(`Print failed: ${response.statusText}`);
    }

    console.log('✅ Printed via Browser Print');
  }

  /**
   * Send via Cloud Bridge (SaaS multi-client)
   */
  private async sendViaCloudBridge(zpl: string): Promise<void> {
    const response = await fetch('/api/print-bridge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'submit', zpl }),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Print failed');
    }

    console.log('✅ Printed via Cloud Bridge');
  }

  /**
   * Print inspection label (Pass/Fail)
   * Optimized for 2.25" x 1.25" label (457 x 254 dots at 203dpi)
   */
  async printInspectionLabel(data: InspectionLabelData): Promise<void> {
    const zpl = `
^XA
^MMT
^MNN
^PW457
^LL254
^FO10,10^A0N,25,25^FD${data.formName}^FS
^FO10,35^GB437,1,1^FS
^FO10,45^A0N,20,20^FD${data.date} ${data.time}^FS
^FO10,70^A0N,20,20^FD${data.submittedBy}^FS
^FO10,100^A0N,35,35^FD${data.status === 'PASS' ? 'PASS' : 'FAIL'}^FS
^FO320,80^BQN,2,3^FDQA,${data.reportUrl}^FS
${data.location ? `^FO10,145^A0N,18,18^FD${data.location}^FS` : ''}
^XZ
    `.trim();

    await this.sendZPL(zpl);
  }

  /**
   * Print temperature log label
   * Optimized for 2.25" x 1.25" label (457 x 254 dots at 203dpi)
   */
  async printTemperatureLabel(data: TemperatureLabelData): Promise<void> {
    const zpl = `
^XA
^MMT
^MNN
^PW457
^LL254
^FO10,10^A0N,22,22^FDTEMP LOG^FS
^FO10,32^GB437,1,1^FS
^FO10,40^A0N,20,20^FD${data.equipment}^FS
^FO10,90^A0N,60,60^FD${data.temperature}°${data.unit}^FS
^FO10,160^A0N,18,18^FD${data.time}^FS
^FO10,185^A0N,18,18^FDBy: ${data.inspector}^FS
${data.location ? `^FO10,210^A0N,16,16^FD${data.location}^FS` : ''}
^XZ
    `.trim();

    await this.sendZPL(zpl);
  }

  /**
   * Print food prep label
   * Optimized for 2.25" x 1.25" label (457 x 254 dots at 203dpi)
   */
  async printFoodPrepLabel(data: FoodPrepLabelData): Promise<void> {
    // Truncate name if too long
    const name = data.name.length > 22 ? data.name.substring(0, 22) : data.name;
    
    // Format allergens
    const allergenText = data.allergens && data.allergens.length > 0
      ? data.allergens.slice(0, 3).join(', ')
      : 'None';

    const zpl = `
^XA
^MMT
^MNN
^PW457
^LL254
^FO20,10^A0N,28,28^FD${name}^FS
^FO20,42^GB417,1,1^FS
^FO20,50^A0N,20,20^FDPrep: ${data.prepDate}^FS
^FO20,75^A0N,20,20^FDEXP: ${data.expirationDate}^FS
^FO20,105^GB417,1,1^FS
${data.ingredients && data.ingredients.length > 0 
  ? `^FO20,115^A0N,16,16^FD${data.ingredients.slice(0, 3).join(', ').substring(0, 38)}^FS` 
  : ''}
^FO20,140^A0N,16,16^FDAllergens: ${allergenText}^FS
^FO20,165^GB417,1,1^FS
^FO20,175^A0N,14,14^FDV7 Form Builder^FS
^FO290,175^A0N,14,14^FD${new Date().toLocaleDateString()}^FS
^XZ
    `.trim();

    await this.sendZPL(zpl);
  }

  /**
   * Test print - simple hello world label
   * Optimized for 2.25" x 1.25" label (457 x 254 dots at 203dpi)
   */
  async testPrint(): Promise<void> {
    const zpl = `
^XA
^MMT
^MNN
^PW457
^LL254
^FO10,10^A0N,35,35^FDTEST PRINT^FS
^FO10,55^A0N,25,25^FDV7 Form Builder^FS
^FO10,90^A0N,20,20^FD${new Date().toLocaleString()}^FS
^FO10,120^A0N,22,22^FDPrinter: Working!^FS
^FO10,150^GB437,1,1^FS
^FO10,160^A0N,18,18^FDLabel: 2.25" x 1.25"^FS
^FO10,185^A0N,18,18^FD203 DPI ZPL Mode^FS
^XZ
    `.trim();

    await this.sendZPL(zpl);
  }
}

// Export singleton instance
export const zebraPrinter = ZebraPrintClient.getInstance();

