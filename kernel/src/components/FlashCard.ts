import { Card, CardProps } from './Card';
import { FirmwareService } from '../services/FirmwareService';
import { DeviceService } from '../services/DeviceService';

export class FlashCard extends Card {
  private dropdown!: HTMLSelectElement;
  private cardContent!: HTMLDivElement;
  private deviceInfoElement: HTMLDivElement | null = null;

  constructor(
    props: CardProps,
    onClick: () => void,
    private firmwareService: FirmwareService,
    private deviceService: DeviceService
  ) {
    super(props, onClick);
    setTimeout(() => this.initializeFlashCard(), 0);
  }

  private initializeFlashCard(): void {
    this.createFirmwareDropdown();
    
    if (this.dropdown) {
      this.handleDropdownClickEvents();
    }
    
    this.setupEventListeners();
  }
  
  private setupEventListeners(): void {
    document.addEventListener('flashComplete', () => {
      this.updateDeviceInfo();

      if (this.dropdown) {
        this.dropdown.value = this.firmwareService.getSelectedFirmwareId();
      }
    });
  }

  private createFirmwareDropdown(): void {

    try {
      this.cardContent = this.element.querySelector('.card-content') as HTMLDivElement;
      if (!this.cardContent) {
        console.error('Card content element not found');
        return;
      }
      
      const existingDropdown = this.cardContent.querySelector('.firmware-dropdown-container');
      if (existingDropdown) {
        console.log('Dropdown already exists, skipping creation');
        return;
      }
      
      const firmwareSection = document.createElement('div');
      firmwareSection.className = 'firmware-section';
      
      this.deviceInfoElement = document.createElement('div');
      this.deviceInfoElement.className = 'device-info';
      this.updateDeviceInfo();
      
      firmwareSection.appendChild(this.deviceInfoElement);
      
      const topDivider = document.createElement('div');
      topDivider.className = 'firmware-divider';
      firmwareSection.appendChild(topDivider);
      
      const dropdownContainer = document.createElement('div');
      dropdownContainer.className = 'firmware-dropdown-container';
      
      const label = document.createElement('label');
      label.className = 'firmware-dropdown-label';
      label.textContent = 'Firmware:';
      
      this.dropdown = document.createElement('select');
      this.dropdown.className = 'firmware-selector';
    
      const firmwareOptions = this.firmwareService.getFirmwareOptions();
      
      Object.entries(firmwareOptions).forEach(([id, option]) => {
        const optionElement = document.createElement('option');
        optionElement.value = id;
        optionElement.textContent = option.name;
        this.dropdown.appendChild(optionElement);
      });

      const deviceType = this.deviceService.getDeviceType();
      if (deviceType) {
        this.dropdown.value = 'auto';
        this.firmwareService.setSelectedFirmwareId('auto');
      } else {
        this.dropdown.value = this.firmwareService.getSelectedFirmwareId();
      }
      
      this.dropdown.addEventListener('change', () => {
        this.firmwareService.setSelectedFirmwareId(this.dropdown.value);
        this.updateDeviceInfo();
      });
      
      dropdownContainer.appendChild(label);
      dropdownContainer.appendChild(this.dropdown);
      
      firmwareSection.appendChild(dropdownContainer);

      this.cardContent.appendChild(firmwareSection);
      console.log('Dropdown added to card');
    } catch (error) {
      console.error('Error creating firmware dropdown:', error);
    }
  }

  private handleDropdownClickEvents(): void {
    if (this.dropdown) {
      this.dropdown.addEventListener('click', (event) => {
        event.stopPropagation();
      });
    }
  }
  
  private updateDeviceInfo(): void {
    if (!this.deviceInfoElement) return;
    
    const deviceType = this.deviceService.getDeviceType();
    const selectedFirmware = this.firmwareService.getSelectedFirmwareId();
    
    this.deviceInfoElement.innerHTML = ``;
    
    if (deviceType) {
      this.deviceInfoElement.innerHTML = `
        <div class="device-detected">
          <div class="device-detected-header">
            <span class="device-icon success">✓</span>
            <span class="device-status">Last connected device</span>
          </div>
          <div class="device-details">
            <span class="firmware-badge">${this.getRecommendedFirmwareForDevice(deviceType)}</span>
          </div>
        </div>
      `;
    } else if (selectedFirmware === 'Auto') {
      this.deviceInfoElement.innerHTML = `
        <div class="device-auto-mode">
          <div class="device-auto-header">
            <span class="device-icon waiting">🔍</span>
            <span class="device-status waiting">Auto-detection mode</span>
          </div>
          <div class="device-action-hint">
            When you click <strong>Flash</strong>, the appropriate firmware will be automatically selected based on your device type.
          </div>
        </div>
      `;
    } else {
      this.deviceInfoElement.innerHTML = `
        <div class="device-not-detected">
          <div class="device-auto-header">
            <span class="device-icon">🔧</span>
            <span class="device-status">Manual selection</span>
          </div>
          <div class="device-manual-mode">
            Will flash with <strong>${selectedFirmware}</strong> firmware regardless of device type
          </div>
        </div>
      `;
    }
    
    this.deviceInfoElement.style.display = 'block';
  }
  
  private getRecommendedFirmwareForDevice(deviceType: string): string {
    if (deviceType.includes('C6')) {
      return 'ESP32-C6';
    } else if (deviceType.includes('C3')) {
      return 'ESP32-C3';
    } else {
      return 'ESP32';
    }
  }

  update(props: CardProps): void {

    this.element.innerHTML = `
      <div class="card-content">
        <div class="card-header">
          <span class="welcome-icon">${props.icon}</span>
          <div>
            <h3 class="card-title">${props.title}</h3>
            <p class="card-description">${props.description}</p>
          </div>
        </div>
      </div>
    `;
    
    this.cardContent = this.element.querySelector('.card-content') as HTMLDivElement;

    setTimeout(() => this.initializeFlashCard(), 0);
  }
}
