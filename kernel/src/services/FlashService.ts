import { ESPLoader } from 'esptool-js';
import * as CryptoJS from 'crypto-js';
import { ProgressOverlay } from '../components/ProgressOverlay';
import { ErrorHandler } from '../utils/ErrorHandler';
import { DeviceService } from './DeviceService';
import { ConsoleService } from './ConsoleService';
import { FirmwareService } from './FirmwareService';

export class FlashService {

  constructor(
    private deviceService: DeviceService,
    private consoleService: ConsoleService,
    private firmwareService: FirmwareService
  ) {}

  static getInstance(): FlashService {
    throw new Error('FlashService.getInstance is deprecated. Use dependency injection instead.');
  }

  async flashDevice(): Promise<void> {
    const progressOverlay = new ProgressOverlay();
    try {
      if (!this.deviceService.getTransport()){
        this.deviceService.clearPort();
        await this.deviceService.requestPort();
      }

      const transport = this.deviceService.getTransport();
      if (!transport) {
        throw new Error('Failed to get device transport');
      }
      try{
        await transport.disconnect()
      } catch (err){}

      const currentFirmware = this.firmwareService.getSelectedFirmwareId();
      progressOverlay.show(currentFirmware);
      const loaderOptions = {
        transport: transport,
        baudrate: 921600,
        romBaudrate: 115600
      };
      const esploader = new ESPLoader(loaderOptions);

      if (transport && transport.device) {
        const port = transport.device;
        const readLocked = port.readable ? port.readable.locked || false : false;
        const writeLocked = port.writable ? port.writable.locked || false : false;

        console.log('Stream state before esploader.main():', {
          readLocked,
          writeLocked,
          port
        });
      }
      progressOverlay.setStatus('Connecting to device...');
      const deviceInfo = await esploader.main();
      console.log("[flashDevice] current device is", deviceInfo);
      if (transport && transport.device) {
        const port = transport.device;
        const readLocked = port.readable ? port.readable.locked || false : false;
        const writeLocked = port.writable ? port.writable.locked || false : false;

        console.log('Stream state after esploader.main():', {
          readLocked,
          writeLocked,
          port,
        },
          esploader.transport.device
        );

        // await port.close()
      }

      if (deviceInfo) {
        console.log(deviceInfo)
        const match = deviceInfo.match(/ESP32[-\w]*/i);
        if (match) {
          const chipType = match[0].toUpperCase();
          console.log(`🔍 Auto-detected device: ${chipType}`);
          
          this.deviceService.setDeviceType(chipType);
          
          const deviceConnectedEvent = new CustomEvent('deviceConnected', {
            detail: { deviceType: chipType }
          });
          document.dispatchEvent(deviceConnectedEvent);
          
          const currentSelection = this.firmwareService.getSelectedFirmwareId();
          
          if (currentSelection === 'Auto') {

            let targetFirmware = 'esp32';
            
            if (chipType.includes('C6')) {
              targetFirmware = 'esp32-c6';
            } else if (chipType.includes('C3')) {
              targetFirmware = 'esp32-c3';
            }
            
            this.firmwareService.setSelectedFirmwareId(targetFirmware);
            
            console.log(`✓ Auto-detection: Using ${targetFirmware} firmware for ${chipType}`);
            
            progressOverlay.setStatus(`Auto-detected ${chipType}. Using ${targetFirmware} firmware...`);
            progressOverlay.setTitle(`Flashing ${targetFirmware} Firmware...`);
          } else {
            console.log(`⚠️ Manual firmware selection: Using ${currentSelection} firmware (device: ${chipType})`);
            progressOverlay.setStatus(`Using manually selected ${currentSelection} firmware...`);
            progressOverlay.setTitle(`Flashing ${currentSelection} Firmware...`);
          }
        } else {
          console.warn(`⚠️ Could not determine chip type from device info. Using default firmware.`);
        }
      }

      progressOverlay.setStatus('Downloading firmware...');
      let firmwareString = await this.firmwareService.downloadFirmware();

      const flashOptions = {
        fileArray: [{
          data: firmwareString,
          address: 0x0
        }],
        flashSize: "keep",
        eraseAll: false,
        compress: true,
        flashMode: "dio",
        flashFreq: "40m",
        reportProgress: (fileIndex: number, written: number, total: number) => {
          progressOverlay.updateProgress(written, total);
          console.log('Flash progress:', {fileIndex, written, total});
        },
        calculateMD5Hash: (image: string) => CryptoJS.MD5(CryptoJS.enc.Latin1.parse(image)).toString()
      };

      if (transport && transport.device) {
        const port = transport.device;
        const readLocked = port.readable ? port.readable.locked || false : false;
        const writeLocked = port.writable ? port.writable.locked || false : false;

        console.log('Stream state before flashing:', {
          readLocked,
          writeLocked
        });
      }

      await esploader.writeFlash(flashOptions);
      progressOverlay.setStatus('Flash complete!');
      
      if (transport && transport.device) {
        const port = transport.device;
        const readLocked = port.readable ? port.readable.locked || false : false;
        const writeLocked = port.writable ? port.writable.locked || false : false;
        
        console.log('Stream state after flashing:', {
          readLocked,
          writeLocked
        });
        
        progressOverlay.setStatus(`Flash complete! Streams: Read ${readLocked ? 'LOCKED' : 'unlocked'}, Write ${writeLocked ? 'LOCKED' : 'unlocked'}`);
      }

      const flashCompleteEvent = new CustomEvent('flashComplete', {
        detail: { success: true }
      });
      document.dispatchEvent(flashCompleteEvent);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Hard resetting via RTS pin...');
      try {
        await esploader.after();
        
        const transportAfter = this.deviceService.getTransport();
        if (transportAfter && transportAfter.device) {
          const port = transportAfter.device;
          const readLocked = port.readable ? port.readable.locked || false : false;
          const writeLocked = port.writable ? port.writable.locked || false : false;
          
          console.log('Stream state after esploader.after():', {
            readLocked,
            writeLocked
          });
          
          progressOverlay.setStatus(`After ESP reset. Streams: Read ${readLocked ? 'LOCKED' : 'unlocked'}, Write ${writeLocked ? 'LOCKED' : 'unlocked'}`);
        }
      } catch (afterError) {
        console.warn('Error during esploader.after():', afterError);
      }

      try {
        const transportBeforeReset = this.deviceService.getTransport();
        if (transportBeforeReset && transportBeforeReset.device) {
          const port = transportBeforeReset.device;
          const readLocked = port.readable ? port.readable.locked || false : false;
          const writeLocked = port.writable ? port.writable.locked || false : false;
          
          console.log('Stream state before device reset:', {
            readLocked,
            writeLocked
          });
        }
        
        progressOverlay.setStatus('Resetting device...');
        await this.deviceService.reset();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        progressOverlay.setStatus('Initializing console...');
        await this.consoleService.resetConsole();
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (resetError) {
        console.warn('Error during device reset:', resetError);
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      await transport.disconnect();
      try {
        const transportBeforeDisconnect = this.deviceService.getTransport();
        if (transportBeforeDisconnect && transportBeforeDisconnect.device) {
          const port = transportBeforeDisconnect.device;
          const readLocked = port.readable ? port.readable.locked || false : false;
          const writeLocked = port.writable ? port.writable.locked || false : false;
          
          console.log('Stream state before disconnect:', {
            readLocked,
            writeLocked
          });
          
          progressOverlay.setStatus(`Cleaning up... Streams: Read ${readLocked ? 'LOCKED' : 'unlocked'}, Write ${writeLocked ? 'LOCKED' : 'unlocked'}`);
          if (readLocked || writeLocked) {
            console.log('Waiting for streams to unlock before disconnect...');
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } else {
          progressOverlay.setStatus('Cleaning up connections...');
        }

      } catch (disconnectError) {
        console.warn('Error during device disconnect:', disconnectError);
      }

      console.warn('Reconnect...');
      await transport.connect()
      await this.deviceService.reset();

      console.warn('Device reset...');
      
      const deviceType = this.deviceService.getDeviceType();
      if (deviceType) {
        const deviceConnectedEvent = new CustomEvent('deviceConnected', {
          detail: { deviceType }
        });
        document.dispatchEvent(deviceConnectedEvent);
      }
    } catch (err) {
      const errorMessage = ErrorHandler.getErrorMessage(err);
      progressOverlay.setStatus(`Flash failed: ${errorMessage}`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    } finally {
      await progressOverlay.hide();
      
    }
  }
}
