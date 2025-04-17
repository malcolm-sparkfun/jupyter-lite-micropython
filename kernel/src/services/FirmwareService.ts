import { FirmwareOption } from '../constants'
import { defaultFirmwareOptions } from '../constants'
import { DeviceService } from './DeviceService';
// const { Octokit } = require('@octokit/rest');
import { unzip } from 'unzipit';

export class FirmwareService {
  private firmwareString: string | null = null;
  // private firmwareBlob: Blob | null = null;
  private selectedFirmwareId: string = 'Auto';
  // Should make firmwareOptions a private variable and use getters to access it.
  // This way we can add logic to the getters if we need to in the future. Default to empty record.
  private firmwareOptions: Record<string, FirmwareOption> = {};
  
  constructor(private deviceService: DeviceService) {
    const savedSelection = localStorage.getItem('selectedFirmwareId');
    // Get the firmware options from GitHub (or local files).
    // Maybe we'll add an explicit button for updating the firmware options in the future...
    // We'll initialize our private firmwareOptions here with the reqFirmwareOptionsGitHub() method.
    
    // Initialize firmware options with defaultFirmwareOptions.
    this.firmwareOptions = defaultFirmwareOptions;

    if (savedSelection) {
      this.selectedFirmwareId = savedSelection;
    } else {
      this.selectedFirmwareId = 'auto';
    }
  }

  private async unzipStreamToVariable(stream: ReadableStream<Uint8Array>): Promise<{ [filename: string]: Uint8Array }> {
    console.log('Unzipping stream...');
    const reader = stream.getReader();
    let chunks = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      chunks.push(value);
    }
  
    const allChunks = new Uint8Array(chunks.flatMap(chunk => [...chunk]));
    console.log('All chunks:', allChunks);
    const { entries } = await unzip(allChunks);
  
    const unzippedData: { [filename: string]: Uint8Array } = {};
    for (const entry of Object.values(entries) as { name: string; arrayBuffer: () => Promise<ArrayBuffer> }[]) {
      console.log('Entry:', entry.name);
      const arrayBuffer = await entry.arrayBuffer();
      unzippedData[entry.name] = new Uint8Array(arrayBuffer);
    }
    return unzippedData;
  }
  

  // We'll use this method to fetch the firmware options from GitHub.
  // We could alternatively use local files in ../binaries/ so we aren't sending a request to GitHub every time.
  private async reqFirmwareOptionsGitHub(): Promise<Record<string, FirmwareOption>> {
    const releases = await fetch('https://api.github.com/repos/sparkfun/micropython/releases', {
      method: 'GET'
    });

    if (!releases.ok) {
      throw new Error(`Failed to fetch releases: ${releases.status} ${releases.statusText}`);
    }
    const releasesData = await releases.json();
    const firmwareOptions: Record<string, FirmwareOption> = {};

    firmwareOptions['auto'] = {
      name: 'Auto detection',
      url: ''
    };

    // Take the first release and iterate through the assets to populate the firmware options.
    const latestRelease = releasesData[0];
    if (latestRelease && latestRelease.assets) {
      latestRelease.assets.forEach((asset: any) => {

        // We should make the name the full name of the asset but the key the firmwareId (the board name in lowercase with dashes and an optional "m" prefix for minimal).
        const firmwareName = asset.name;
        var firmwareId = firmwareName.replace(/\.uf2|\.zip/g, '').toLowerCase().replace(/_/g, '-');

        if (firmwareName.startsWith('MINIMAL_')) {
          firmwareId = 'm-' + firmwareId.replace('minimal-', '');
        }

        //method 1: use the browser_download_url from the asset object.
        const firmwareUrl = asset.browser_download_url;

        // log the asset object
        console.log('Asset:', asset);

        const firmwareOption: FirmwareOption = {
          name: firmwareName,
          url: firmwareUrl
        };

        firmwareOptions[firmwareId] = firmwareOption;
      });
    }
    
    // Add the local firmware option.
    firmwareOptions['local'] = {
      name: 'Local firmware upload',
      url: ''
    };

    // log the firmware options for debugging.
    console.log('FINAL Firmware options:', firmwareOptions);
    
    return firmwareOptions;
  }

  // Create an init function that performs any asynchronous initialization for the firmware service. For now that will just be fetching the firmware options from GitHub.
  async init(): Promise<void> {
    // Log that we're in the init method.
    console.log('Initializing firmware service...');
    
    // Fetch the firmware options from GitHub.
    try {
      this.firmwareOptions = await this.reqFirmwareOptionsGitHub();
      console.log('Firmware options initialized:', this.firmwareOptions);
    } catch (error) {
      console.error('Error fetching firmware options:', error);
    }
  }

  // This is where we can add our logic of fetching from GitHub.
  // We could alternatively use local files in ../binaries/ so we aren't sending a request to GitHub every time.
  getFirmwareOptions(){
    return this.firmwareOptions;
  }

  getSelectedFirmwareId(): string {
    return this.selectedFirmwareId;
  }

  setSelectedFirmwareId(id: string): void {
    if (id in this.firmwareOptions) {
      this.selectedFirmwareId = id;
      this.firmwareString = null;
      // this.firmwareBlob = null;
      localStorage.removeItem('cachedFirmware');
      localStorage.setItem('selectedFirmwareId', id);
    }
  }

  async downloadFirmware(): Promise<string> {
    const savedFirmwareId = localStorage.getItem('selectedFirmwareId');
    if (savedFirmwareId) {
      this.selectedFirmwareId = savedFirmwareId;
    }
    
    if (this.selectedFirmwareId === 'auto') {
      console.log('Auto-detecting firmware...');
      return this.downloadAutoDetectedFirmware();
    } else {
      console.log('FirmwareService: Downloading firmware for:', this.selectedFirmwareId);
      return this.downloadSpecificFirmware(this.selectedFirmwareId);
    }
  }
  
  private async downloadAutoDetectedFirmware(): Promise<string> {
    const deviceType = this.deviceService.getDeviceType();
    let firmwareId: string;
    
    if (!deviceType) {
      console.warn('No device detected for auto firmware detection. Using generic ESP32 firmware.');
      firmwareId = 'esp32';
    } else if (deviceType.includes('C6')) {
      console.log('Auto-detected ESP32-C6, using corresponding firmware');
      firmwareId = 'esp32-c6';
    } else if (deviceType.includes('C3')) {
      console.log('Auto-detected ESP32-C3, using corresponding firmware');
      firmwareId = 'esp32-c3';
    } else {
      console.log('Auto-detected generic ESP32, using corresponding firmware');
      firmwareId = 'esp32';
    }
    
    return this.downloadSpecificFirmware(firmwareId);
  }
  
  // TODO: This is where we can add our logic of fetching from GitHub
  private async downloadSpecificFirmware(firmwareId: string): Promise<string> {

    console.log("Downloading firmware for:", firmwareId);
    const selectedFirmware = this.firmwareOptions[firmwareId]
    if (!selectedFirmware || !selectedFirmware.url) {
      throw new Error(`Invalid firmware selection or no URL for: ${firmwareId}`);
    }

    // GitHub requires a CORS proxy to fetch files from their API. We'll use a public CORS proxy for now.
    // See: https://github.com/orgs/community/discussions/106849 
    const cors_proxy = "https://corsproxy.io/?url=";
    console.log("Performing fetch for firmware:", cors_proxy + selectedFirmware.url);
    
    // method 1: browser_download_url from the asset object.
    const result = await fetch(cors_proxy + selectedFirmware.url, {
      mode: 'cors',
      headers: {
        'Accept': 'application/octet-stream',
      },
    });

    if (!result.ok) {
      console.log("Error fetching firmware:", result.status, result.statusText);
      throw new Error(`Failed to fetch firmware: ${result.status} ${result.statusText}`);
    }

    const firmwareData = await this.unzipStreamToVariable(result.body!);

    const firmwareDataMP = firmwareData['micropython.bin'];

    this.firmwareString = Array.from(firmwareDataMP)
      .map(byte => String.fromCharCode(byte))
      .join('');
    
    // Log the raw firmware data for debugging.
    console.log('Raw firmware data:', this.firmwareString);

    // this.firmwareBlob = await result.blob();
    // const uint8Array = new Uint8Array(await this.firmwareBlob.arrayBuffer());
    // this.firmwareString = Array.from(uint8Array)
    //   .map(byte => String.fromCharCode(byte))
    //   .join('');

    console.log('Downloaded SFE FIRMWARE. Firmware string size:', this.firmwareString.length);
    return this.firmwareString;
  }

}
