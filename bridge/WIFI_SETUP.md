# 📶 ZD421 WiFi Setup Guide

## Step 1: Get Printer Network Info

### Option A: Print Network Config (Easiest)
1. **Press and hold** the **Feed button** (front of printer) for **2 seconds**
2. Printer will print a network configuration label
3. Look for:
   - `Wireless Status`: Should say "Connected" or "Not Connected"
   - `IP Address`: e.g., `192.168.1.100`
   - `SSID`: Network name (if already connected)

### Option B: Check Via QR Code
- Your printer came with a "Support and Information" card
- Scan the QR code that says **"View user documentation"**
- Look for WiFi setup instructions

---

## Step 2: Connect Printer to WiFi

### Method 1: Zebra Setup Utilities (Recommended)

1. **Download Zebra Setup Utilities**:
   - Go to: https://www.zebra.com/us/en/support-downloads/software/printer-software/zebra-setup-utilities.html
   - Download for macOS
   - Install and open

2. **Connect to Printer**:
   - In Zebra Setup Utilities, click "Configure Printer Connectivity"
   - Select "WiFi"
   - Choose your network and enter password
   - Printer will restart and connect

3. **Verify Connection**:
   - Print network config again (Feed button for 2 seconds)
   - Check that `Wireless Status: Connected`
   - Note the IP address

### Method 2: Printer Control Panel (If your model has a screen)

1. Press **Settings** button on printer
2. Navigate to **Network** → **WiFi**
3. Select your network name
4. Enter WiFi password
5. Save and restart printer

### Method 3: Web Interface (Advanced)

1. Connect printer via USB first
2. Find printer's IP: Print network config label
3. Open browser, go to: `http://[printer-ip-address]`
4. Login (default: admin / 1234)
5. Configure WiFi settings
6. Disconnect USB after WiFi is working

---

## Step 3: Add Printer to macOS

1. Open **System Settings** (Apple menu → System Settings)
2. Click **Printers & Scanners**
3. Click the **"+"** button (Add Printer)
4. Wait 5-10 seconds for printer to appear
5. Select **"ZD421-203dpi ZPL"** (should show IP address)
6. Click **"Add"**

> 💡 If printer doesn't appear automatically, click "IP" tab and enter the IP address manually

---

## Step 4: Test the Bridge

1. **Restart the bridge** (if it's running):
   ```bash
   # Stop current bridge (Ctrl+C)
   # Then restart:
   cd /Users/stephennewman/v7/bridge
   node v7-print-bridge.js
   ```

2. **Look for**:
   ```
   ✅ Found printer: ZD421-203dpi-ZPL
      Connection: 📶 WiFi/Network
   ```

3. **Test print from V7**:
   - Go to http://localhost:3000/prep-labels
   - Upload a menu image
   - Click print on a food item

---

## Troubleshooting

### "Printer not connecting to WiFi"
- Check WiFi password is correct
- Ensure 2.4GHz network (printer may not support 5GHz)
- Printer must be within range of WiFi router
- Some corporate WiFi networks block device connections (try guest network)

### "Printer doesn't show up in macOS"
- Print network config: Should show `Wireless Status: Connected`
- Verify IP address is on same subnet as your Mac (e.g., both 192.168.1.x)
- Try adding manually: IP tab → Enter IP → Protocol: Line Printer Daemon - LPD

### "Bridge doesn't detect printer"
- Run: `lpstat -p | grep -i zebra` (should show printer name)
- If nothing, printer isn't added to macOS yet
- Remove and re-add printer in System Settings

---

## Quick Reference Commands

```bash
# Check if macOS sees the printer
lpstat -p | grep -i zebra

# Check printer connection details
lpstat -v | grep -i zebra

# Send test print manually
echo "^XA^FO50,50^A0N,50,50^FDTest Print^FS^XZ" | lp -d [printer-name] -o raw
```

---

**Need Help?** Take a photo of:
1. The network config label from your printer
2. The Printers & Scanners screen on macOS
3. The bridge console output

We'll figure it out! 🎯

