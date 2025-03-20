import { Card } from './Card';
import { DeviceService } from '../services/DeviceService';

export class ConnectCard extends Card {
  private deviceService: DeviceService;

  private async connect_disconnect() {
    if (!this.deviceService.isConnected()) {
      this.element.classList.add('connecting');
      this.element.innerHTML = `
        <div class="card-content">
          <span class="welcome-icon device-icon waiting">⟳</span>
          <div>
            <h3 class="card-title">Connecting...</h3>
            <p class="card-description">Please wait while we connect to your device</p>
          </div>
        </div>
      `;
      await this.deviceService.connect();
    }
  }

  constructor(props: any, deviceService: DeviceService) {
    super(props, () => this.connect_disconnect());
    this.deviceService = deviceService;

    document.addEventListener('deviceConnected', (event: Event) => {
      this.processCardUI(props);
    });
  }

  processCardUI(props: any): void {
    if (this.deviceService === undefined) {
      this.element.innerHTML = `
        <div class="card-content">
          <span class="welcome-icon">${props.icon || '🔌'}</span>
          <div>
            <h3 class="card-title">${props.title || 'Connect Device'}</h3>
            <p class="card-description">${props.description || 'Connect your device to get started'}</p>
          </div>
        </div>
      `;
      return;
    }

    if (this.deviceService.isConnected()) {
      this.element.innerHTML = `
        <div class="card-content">
          <span class="welcome-icon device-icon success">✓</span>
          <div>
            <h3 class="card-title">Device Connected</h3>
            <p class="card-description">
              Your device is already connected and ready to use.
              <span class="device-status">To reconnect, please refresh the page.</span>
            </p>
          </div>
        </div>
      `;
      this.element.classList.add('device-connected');
    }
  }

}
