
export interface FirmwareOption {
  name: string;
  url: string;
}

// Optionally in the future could switch to initialize with this and make it align with a recent-ish release...
export const defaultFirmwareOptions: Record<string, FirmwareOption> = {
  'auto': {
    name: 'Auto detection',
    url: ''
  },
  'esp32-c3': {
    name: 'ESP32-C3',
    url: '../binaries/ESP32_GENERIC_C3-20241129-v1.24.1.bin'
  },
  'esp32-c6': {
    name: 'ESP32-C6',
    url: '../binaries/ESP32_GENERIC_C6-20241129-v1.24.1.bin'
  }
};

