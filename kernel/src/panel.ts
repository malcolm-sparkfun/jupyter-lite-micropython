import { globalStyles, animations, overlayStyles, dialogStyles, minimizedStyles, cardStyles, buttonStyles, progressOverlayStyles } from './styles';
import { MinimizedButton } from './components/MinimizedButton';
// import { Dialog } from './components/Dialog';
import { ServiceContainer } from './services/ServiceContainer';

// class DialogPanel {
//   private element: HTMLDivElement;

//   constructor(dialog: Dialog) {
//     this.element = document.createElement('div');
//     this.element.id = 'dialog-widget-panel';
//     this.element.appendChild(dialog.getElement());
//   }

//   show(): void {
//     this.element.style.display = 'block';
//     this.element.classList.remove('minimized');
//     this.element.classList.add('visible');

//     this.element.style.transition = 'opacity 0.3s ease-in-out';
//     this.element.style.opacity = '1';
//   }

//   hide(): void {
//     this.element.classList.add('minimizing');
//     this.element.classList.remove('visible');
//     this.element.style.opacity = '0';

//     setTimeout(() => {
//       this.element.style.display = 'none';
//       this.element.classList.remove('minimizing');
//       this.element.classList.add('minimized');
//     }, 300);
//   }

//   getElement(): HTMLDivElement {
//     return this.element;
//   }
// }

class MinimizedPanel {
  private element: HTMLDivElement;
  private minimizedButton: MinimizedButton;

  constructor(minimizedButton: MinimizedButton) {
    this.minimizedButton = minimizedButton;
    this.element = document.createElement('div');
    this.element.id = 'minimized-panel-widget-panel';
    this.element.appendChild(minimizedButton.getElement());
  }

  show(): void {
    this.element.style.display = 'block';
    this.element.classList.remove('minimized');
    this.element.classList.add('visible');

    this.element.style.transition = 'opacity 0.3s ease-in-out';
    this.element.style.opacity = '1';
    this.minimizedButton.show();
  }

  hide(): void {
    this.element.classList.add('minimizing');
    this.element.classList.remove('visible');
    this.element.style.opacity = '0';
    this.minimizedButton.hide();

    setTimeout(() => {
      this.element.style.display = 'none';
      this.element.classList.remove('minimizing');
      this.element.classList.add('minimized');
    }, 300);
  }

  getElement(): HTMLDivElement {
    return this.element;
  }


  updateOnConnection(msg: string): void{
    this.minimizedButton.updateOnConnection(msg)
  }
  updateOnDisconnection(msg: string): void{
    this.minimizedButton.updateOnDisconnection(msg)
  }
}

export default class WelcomePanel {
  private element: HTMLDivElement;

  private minimizedPanel: MinimizedPanel;
  // private dialogPanel: DialogPanel;

  // constructor(private serviceContainer: ServiceContainer) {
  constructor() {

    this.element = document.createElement('div');
    this.element.id = 'jp-kernel-welcome-panel';
    
    let styleElement = document.createElement('style');
    styleElement.textContent = [
      globalStyles,
      animations,
      overlayStyles,
      dialogStyles,
      minimizedStyles,
      cardStyles,
      buttonStyles,
      progressOverlayStyles
    ].join('\n');
    document.head.appendChild(styleElement);

    // TODO: 
    // 1) We no longer want the dialog to be shown on startup and we also don't want it 
    // to be shown when the user clicks on the minimized button.
    // 2) We want to act as if the connect card was clicked when the user clicks on the minimized button.
    // 3) We want there to be a new popup if connecting to the device fails that contains suggestions for why
    
    // currently objects are like this:

    // WelcomePanel -> MinimizedPanel -> MinimizedButton -> DeviceService    <-|
    // WelcomePanel -> DialogPanel -> Dialog -> ConnectCard -> DeviceService <-|
    // We want to change this to be like this:
    // WelcomePanel -> MinimizedPanel -> MinimizedButton -> DeviceService

    // need a good way to add the same connection behavior but up a level

    const minimizedButton = new MinimizedButton(() => this.show());
    this.minimizedPanel = new MinimizedPanel(minimizedButton);

    // const dialog = new Dialog({
    //   closeDialog: () => this.hide(),
    //   serviceContainer: this.serviceContainer,
    // });
    // this.dialogPanel = new DialogPanel(dialog);

    this.element.appendChild(this.minimizedPanel.getElement());
    // this.element.appendChild(this.dialogPanel.getElement());

    document.addEventListener('deviceConnected', (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail)
      {
        if (customEvent.detail.msg) {
          console.log(customEvent.detail.msg)
          this.updateOnConnection(customEvent.detail.msg)
        }
      }
    });

    document.addEventListener('deviceDisconnected', (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail)
      {
        if (customEvent.detail.msg) {
          console.log(customEvent.detail.msg)
          this.updateOnDisconnection(customEvent.detail.msg)
        }
      }
    });
  }

  getElement(): HTMLDivElement {
    return this.element;
  }

  updateOnConnection(connection_msg: string): void{
    this.minimizedPanel.updateOnConnection(connection_msg)
  }
  updateOnDisconnection(connection_msg: string): void{
    this.minimizedPanel.updateOnConnection(connection_msg)
  }

  show(): void {
    // This is where we will do or invoke the toggling of the connection
    this.element.style.display = 'block';
    this.element.classList.remove('minimized');
    this.element.classList.add('visible');

    this.element.style.transition = 'opacity 0.3s ease-in-out';
    this.element.style.opacity = '1';

    // this.dialogPanel.show();
    //this.minimizedPanel.hide();
  }

  hide(): void {
    // this.dialogPanel.hide();
    this.minimizedPanel.show();
  }
}