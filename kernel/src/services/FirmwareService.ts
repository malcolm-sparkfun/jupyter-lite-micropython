import { FirmwareOption } from '../constants'
import { defaultFirmwareOptions } from '../constants'
import { DeviceService } from './DeviceService';

export class FirmwareService {
  private firmwareString: string | null = null;
  private firmwareBlob: Blob | null = null;
  private selectedFirmwareId: string = 'Auto';
  // Should make firmwareOptions a private variable and use getters to access it.
  // This way we can add logic to the getters if we need to in the future. Default to empty record.
  private firmwareOptions: Record<string, FirmwareOption> = {};
  
  constructor(private deviceService: DeviceService) {
    const savedSelection = localStorage.getItem('selectedFirmwareId');
    // Get the firmware options from GitHub (or local files).
    // Maybe we'll add an explicit button for updating the firmware options in the future...
    // We'll initialize our private firmwareOptions here with the reqFirmwareOptionsGitHub() method.
    // console.log("In the constructor about to fetch firmware options from GitHub...");
    // this.reqFirmwareOptionsGitHub().then((res) => {
    //   // log the res 
    //   console.log('Firmware options response:', res);
    //   this.firmwareOptions = res;
    // })

    // Log the firmware options to the console for debugging.
    // console.log('Firmware options:', this.firmwareOptions);
    
    // Initialize firmware options with defaultFirmwareOptions.
    this.firmwareOptions = defaultFirmwareOptions;

    if (savedSelection) {
      this.selectedFirmwareId = savedSelection;
    } else {
      this.selectedFirmwareId = 'auto';
    }
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
        const firmwareUrl = asset.browser_download_url;

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
      this.firmwareBlob = null;
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

    console.log("Performing fetch for firmware:", selectedFirmware.url);

    const result = await fetch(selectedFirmware.url, {});

    console.log('Firmware fetch result:', result);

    // if (!result.ok) {
    //   console.log("Error fetching firmware:", result.status, result.statusText);
    //   throw new Error(`Failed to fetch firmware: ${result.status} ${result.statusText}`);
    // }

    this.firmwareBlob = await result.blob();
    const uint8Array = new Uint8Array(await this.firmwareBlob.arrayBuffer());
    this.firmwareString = Array.from(uint8Array)
      .map(byte => String.fromCharCode(byte))
      .join('');

    console.log('Downloaded SFE FIRMWARE. Firmware string size:', this.firmwareString.length);
    return this.firmwareString;
  }

}
