# V7 Print Bridge

Connect your local Zebra ZD421 printer to the V7 cloud platform.

## 🚀 Quick Start

### Installation (One-time)

**Option 1: Using NPX** (Recommended)
```bash
npx v7-print-bridge
```

**Option 2: Install Globally**
```bash
npm install -g v7-print-bridge
v7-print-bridge
```

**Option 3: Manual Install**
```bash
# Download and extract
cd v7-print-bridge
npm install
npm start
```

### Setup

#### 🔌 USB Connection
1. **Plug in your Zebra printer** via USB cable
2. **Turn on the printer**
3. **Run the bridge** using one of the commands above
4. **Go to V7 Settings** → Printer Setup
5. **Click "Test Print"** to verify connection

#### 📶 WiFi Connection (Recommended)
1. **Connect printer to WiFi**:
   - Press and hold the Feed button for 2 seconds
   - Print the network configuration label
   - Use Zebra Setup Utilities app OR printer control panel to connect to WiFi
   - Note the printer's IP address from the printed label

2. **Add printer to your computer**:
   - **macOS**: System Settings → Printers & Scanners → Click "+" → Select your ZD421
   - **Windows**: Settings → Devices → Printers & Scanners → Add a printer

3. **Run the bridge** using one of the commands above
4. **Go to V7 Settings** → Printer Setup
5. **Click "Test Print"** to verify connection

> 💡 **WiFi Benefits**: Printer can be anywhere in your facility, bridge can run on any device on the network

### Status Indicators

- `✅ Connected to V7 cloud` - Successfully connected
- `✅ Found printer: [name]` - Printer detected
- `🖨️  Printing label...` - Sending job to printer
- `⚠️  Disconnected from V7 cloud` - Connection lost, auto-reconnecting

### Requirements

- **Node.js** 14 or higher ([Download](https://nodejs.org))
- **Zebra ZD421** printer with USB, WiFi, or Bluetooth
- **macOS, Windows, or Linux**

### Troubleshooting

**"No Zebra printer found"**
- Ensure printer is powered on
- **USB**: Check USB cable connection
- **WiFi**: Ensure printer and computer are on the same network
- **macOS**: System Settings → Printers & Scanners (should show Zebra)
- **Windows**: Devices & Printers (should show Zebra)
- Try running: `lpstat -p | grep -i zebra` (should show your printer)

**"Connection failed"**
- Check your internet connection
- Firewall might be blocking WebSocket connections
- Contact V7 support

### Running as a Service

**macOS/Linux (systemd)**
```bash
# Create service file
sudo nano /etc/systemd/system/v7-print-bridge.service

[Unit]
Description=V7 Print Bridge
After=network.target

[Service]
Type=simple
User=yourusername
ExecStart=/usr/local/bin/v7-print-bridge
Restart=always

[Install]
WantedBy=multi-user.target

# Enable and start
sudo systemctl enable v7-print-bridge
sudo systemctl start v7-print-bridge
```

**Windows (Task Scheduler)**
- Open Task Scheduler
- Create Basic Task
- Trigger: At startup
- Action: Start a program
- Program: `node`
- Arguments: `C:\path\to\v7-print-bridge.js`

### Configuration

Set environment variables (optional):

```bash
# Custom WebSocket URL (default: wss://v7builder.com)
export V7_WEBSOCKET_URL=wss://your-domain.com

# API Key from V7 Settings
export V7_API_KEY=your-api-key

# Then run
v7-print-bridge
```

### Support

- 📧 Email: support@v7builder.com
- 💬 Chat: [V7 Dashboard](https://app.v7builder.com)
- 📚 Docs: [docs.v7builder.com](https://docs.v7builder.com)

---

**Made with ❤️ by V7 Form Builder**

