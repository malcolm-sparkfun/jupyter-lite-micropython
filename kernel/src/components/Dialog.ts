import { ConnectCard } from './ConnectCard';
import { ServiceContainer } from '../services/ServiceContainer';

export interface DialogProps {
  closeDialog: () => void;
  serviceContainer: ServiceContainer;
}

export class Dialog {
  private element: HTMLDivElement;
  private connectCard: ConnectCard;

  constructor(props: DialogProps) {
    this.element = document.createElement('div');
    this.element.className = 'welcome-overlay';
    this.element.addEventListener('click', (e) => {
      if (e.target === this.element) {
        props.closeDialog
      }
    });

    const closeButton = this.createCloseButton(props.closeDialog);
    const header = this.createHeader();
    const optionsContainer = this.createOptionsContainer();

    this.connectCard = new ConnectCard(
    {
      action: 'connect',
      icon: '🔌',
      title: 'Connect Device',
      description: 'Connect to RedBoard via serial',
      color: 'var(--ui-navy)'
    },
    props.serviceContainer.deviceService);

    optionsContainer.appendChild(this.connectCard.getElement());

    let content = document.createElement('div');
    content.className = 'welcome-dialog';

    content.appendChild(closeButton);
    content.appendChild(header);
    content.appendChild(optionsContainer);

    this.element.appendChild(content);
  }

  private createCloseButton(onCloseDialog: () => void): HTMLButtonElement {
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.innerHTML = '×';
    closeButton.addEventListener('click', onCloseDialog);
    return closeButton;
  }

  private createHeader(): HTMLDivElement {
    const header = document.createElement('div');
    header.innerHTML = '<h1 class="welcome-title">RedBoard Device Manager</h1>';
    return header;
  }

  private createOptionsContainer(): HTMLDivElement {
    const container = document.createElement('div');
    container.style.cssText = 'display: flex; flex-direction: column; gap: 1rem;';
    return container;
  }

  getElement(): HTMLDivElement {
    return this.element;
  }
}
