export class MinimizedButton {
  private element: HTMLElement;
  private deviceLabel: HTMLSpanElement;
  private statusIndicator: HTMLSpanElement;

  constructor(onShow: () => void) {
    this.element = document.createElement('div');
    this.element.className = 'esp-button-container';
    this.element.title = 'Open RedBoard Device Manager';
    this.element.style.display = 'none';
    this.element.addEventListener('click', onShow);

    const minimizedButton = document.createElement('button');
    minimizedButton.className = 'minimized-button';

    const contentContainer = document.createElement('div');
    contentContainer.className = 'button-content';

    const img = document.createElement('img');
    img.src = 'https://acceleratingvector.com/flame.svg';
    img.alt = 'SparkFun Electronics Logo';
    contentContainer.appendChild(img);
    
    const statusWrapper = document.createElement('div');
    statusWrapper.className = 'status-wrapper';
    
    this.statusIndicator = document.createElement('span');
    this.statusIndicator.className = 'status-indicator';
    statusWrapper.appendChild(this.statusIndicator);
    
    this.deviceLabel = document.createElement('span');
    this.deviceLabel.className = 'device-label';
    this.deviceLabel.textContent = 'Not connected';
    statusWrapper.appendChild(this.deviceLabel);

    contentContainer.appendChild(statusWrapper);
    minimizedButton.appendChild(contentContainer);
    this.element.appendChild(minimizedButton);
  }

  show(): void {
    this.element.style.display = 'flex';
  }

  hide(): void {
    this.element.style.display = 'none';
  }

  getElement(): HTMLElement {
    return this.element;
  }

  updateOnConnection(msg: string){
    this.statusIndicator.classList.add('connected');
    this.statusIndicator.classList.remove('disconnected');
    this.deviceLabel.textContent = msg;
    this.element.title = `Open RedBoard Device Manager (${msg})`;
  }
  updateOnDisconnection(msg: string){
    this.statusIndicator.classList.add('disconnected');
    this.statusIndicator.classList.add('connected');
    this.deviceLabel.textContent = msg;
    this.element.title = `Open RedBoard Device Manager (${msg})`;
  }
}
