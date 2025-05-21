import { Transport } from 'esptool-js';

export class DeviceService {
  private port: SerialPort | null = null;
  private portChecked: boolean = false;
  private transport: Transport | null = null;
  private isDeviceConnected: boolean = false;
  private deviceType: string = '';
  private decoder: TextDecoder = new TextDecoder();

  constructor() {}

  // Check if port is available (return true if available)
  // Don't run if we are already connected from within this tab
  async checkPort(): Promise<boolean> {
    if (!this.port) {
      console.log('[checkPort]: No port selected');
      return false;
    }

    // Return false if the port is already open by us
    if (this.port.readable || this.port.writable) {
      console.log('[checkPort]: Port is already open by us...skipping check');
      return false;
    }

    // Try opening and closing the port to check if it's available
    console.log('[checkPort]: Checking if port is available');
    try {
      await this.port.open({ baudRate: 115200 });
      await this.port.close();
    }
    catch (err) {
      console.log('[checkPort]: Port is already open by another application');
      return false;
    }

    // If we reach here, the port is available
    console.log('[checkPort]: Port is available');
    return true;
  }

  async requestPort(): Promise<void> {
    try {
      const port = await navigator.serial.requestPort();
      this.port = port;
          
      // Check if the port is open by another application (or ourselves in another tab)
      this.portChecked = await this.checkPort()
      if (this.portChecked) {
        console.log('[requestPort]: Port is available');
        this.transport = new Transport(port);
      }
      else{
        console.log('[requestPort]: Port is already open by another application');
      }

    } catch (err) {
      console.error('[requestPort]: Failed to get port:', err);
      throw err;
    }
  }

  async connect(logCallback: (msg: string) => void = console.log): Promise<void> {
    await this.requestPort();

    if (!this.port) {
      logCallback('No port selected, try again.');
      return;
    }

    if (!this.portChecked) {
      logCallback('Port cannot be opened.\nIs the port already open in another application or tab?');
      return;
    }

    try {
      if (this.isDeviceConnected) {
        logCallback('Already connected, skipping connection');
        return;
      }
      
      if (!this.port.readable && !this.port.writable) {
        this.transport?.connect()
      } else {
        logCallback('Port is already open, skipping connection');
      }
      
      this.isDeviceConnected = true;
    } catch (err) {
      logCallback('Failed to connect:');
      throw err;
    }
    
    const event = new CustomEvent("deviceConnected", {
        detail: { msg: "Connected" }
    });
    document.dispatchEvent(event)
  }

  async disconnect(): Promise<void> {
    if (this.port) {
      try {
        if (this.port.readable)
          await this.port.readable.cancel();
        else if (this.port.writable)
          await this.port.writable.abort();
        else
          await this.port.close();
        
        console.log('Device disconnected successfully');
      } catch (err) {
        console.error('Failed to disconnect:', err);
      } finally {
        this.isDeviceConnected = false;
      }
    } else {
      this.isDeviceConnected = false;
    }

    const event = new CustomEvent("deviceDisconnected", {
      detail: { msg: "Not connected" }
    });
    document.dispatchEvent(event)
  }

  async reset(): Promise<void> {
    if (!this.port) {
      throw new Error('No port selected');
    }

    try {
      await this.port.setSignals({ dataTerminalReady: false });
      await new Promise(resolve => setTimeout(resolve, 100));
      await this.port.setSignals({ dataTerminalReady: true });
    } catch (err) {
      console.error('Failed to reset device:', err);
      throw err;
    }
  }

  getTransport(): Transport | null {
    return this.transport;
  }

  isConnected(): boolean {
    return this.isDeviceConnected;
  }
  
  setDeviceType(type: string): void {
    this.deviceType = type;
    console.log(`Device type set to: ${type}`);
  }
  
  getDeviceType(): string {
    return this.deviceType;
  }

  clearPort(): void {
    if (this.port) {
      console.log('Clearing device port reference');
      this.port = null;
      this.transport = null;
    }
    this.isDeviceConnected = false;
  }

  async sendCommand(code: string): Promise<boolean> {
    if (!this.transport || !this.transport.device.writable) {
      return false;
    }

    try {
      const encoder = new TextEncoder();
      const ctrl_d = new Uint8Array([4]);
      const ctrl_e = new Uint8Array([5]);
      const new_line = encoder.encode('\r\n');
      
      const writer = this.transport.device.writable.getWriter();
      
      await writer.write(ctrl_e);
      await writer.write(new_line);
      
      const data = encoder.encode(code + "######START REQUEST######");
      await writer.write(data);
      
      await writer.write(ctrl_d);
      await writer.write(new_line);
      
      writer.releaseLock();
      return true;
    } catch (error) {
      console.error('Error sending command to device:', error);
      return false;
    }
  }

  async sendInterrupt(): Promise<boolean> {
    if (!this.transport || !this.transport.device.writable) {
      return false;
    }

    try {
      const encoder = new TextEncoder();
      const ctrl_c = new Uint8Array([3]);
      const new_line = encoder.encode('\r\n');
      
      const writer = this.transport.device.writable.getWriter();
      await writer.write(ctrl_c);
      await writer.write(new_line);
      writer.releaseLock();
      return true;
    } catch (error) {
      console.error('Error sending interrupt to device:', error);
      return false;
    }
  }

  private async readFromDevice(): Promise<IteratorResult<Uint8Array, any>> {
    if (!this.transport || !this.transport.device.readable) {
      console.error('Transport not readable in readFromDevice');
      return { value: undefined, done: true };
    }

    try {
      const readLoop = this.transport.rawRead();
      return await readLoop.next();
    } catch (error) {
      console.error('Error reading from device:', error);
      
      return { value: undefined, done: true };
    }
  }

  async readAndDecodeFromDevice(): Promise<{ text: string, done: boolean }> {
    const { value, done } = await this.readFromDevice();
    console.log('[readAndDecodeFromDevice] ', value);
    if (done || !value) {
      return { text: '', done: true };
    }
    
    const text = this.decoder.decode(value);
    return { text, done: false };
  }

}
