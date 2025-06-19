import { ConnectCard } from './ConnectCard';
import { ServiceContainer } from '../services/ServiceContainer';
import { Card } from './Card';
import { LabShell } from '@jupyterlab/application';
import { NotebookPanel } from '@jupyterlab/notebook';
import type { JupyterLiteServer } from '@jupyterlite/server';

export interface DialogProps {
  closeDialog: () => void;
  serviceContainer: ServiceContainer;
  app?: JupyterLiteServer;
}

export class Dialog {
  private element: HTMLDivElement;
  private connectCard: ConnectCard;
  private saveCard: Card

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

    this.saveCard = new Card({
      action: 'save',
      icon: '📥',
      title: 'Save Notebook',
      description: 'Save notebook to RedBoard',
      color: 'var(--ui-red)'
    }, 
    // create an arrow function that calls the save method on the serviceContainer but first iterates over all cells and gathers their code content if they are code cells
    async () => {
      // TODO: current widget might not be correct at this level, need to check and possibly change how we're getting this
      const notebook = props.app?.shell.currentWidget as NotebookPanel | null;
      var allCellContent : string = '';

      console.log("[Dialog] saveCard: Saving notebook content...");

      if (notebook) {
        console.log("[Dialog] saveCard: Found notebook:", notebook.title.label);
        notebook.revealed.then(() => {
          
          
          for (const cell of notebook.content.model.cells) {
            // TODO: nbformat has this property as 'cell_type' not 'type'
            // but it seems from the JupyterLab direct docs that it should be 'type'
            if (cell.type === 'code') {
              allCellContent += cell.source + '\n\n';
            }
          }

          console.log("[Dialog] saveCard: Cells to save:", allCellContent);
        });  
      }

      return props.serviceContainer.saveCodeToDevice(allCellContent, (content) => {
        console.log("[Dialog] saveCard: Streaming output:", content);
      });
    });

    optionsContainer.appendChild(this.connectCard.getElement());
    optionsContainer.appendChild(this.saveCard.getElement());

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

