// Removed Widget import as we're no longer using @lumino/widgets
import { JupyterLiteServer, JupyterLiteServerPlugin } from '@jupyterlite/server';
import { IKernel, IKernelSpecs } from '@jupyterlite/kernel';
import { EmbeddedKernel } from './kernel';
import WelcomePanel from './panel';
import { ServiceContainer } from './services/ServiceContainer';
import { DeviceService } from './services/DeviceService';
import { JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application';
import { INotebookTracker } from '@jupyterlab/notebook';

// Variable for saving the DeviceService instance so we can restore it if kernel is restarted 
var devService: DeviceService | null = null;

let notebookTracker: INotebookTracker | null = null;

// Frontend plugin to capture the notebook tracker
const frontendPlugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlite-embedded-kernel:frontend',
  autoStart: true,
  requires: [INotebookTracker as any],
  activate: (_app: JupyterFrontEnd, tracker: INotebookTracker) => {
    notebookTracker = tracker;
    console.log('Embedded Kernel Frontend Plugin Activated');

    console.log('Notebook Tracker:', notebookTracker);
  }
};

// Kernel plugin for the embedded kernel
const kernelPlugin: JupyterLiteServerPlugin<void> = {
  id: 'jupyterlite-embedded-kernel:kernel',
  autoStart: true,
  requires: [IKernelSpecs],
  activate: (app: JupyterLiteServer, kernelspecs: IKernelSpecs) => {
    const activeKernels = new Map<string, EmbeddedKernel>();

    app.router.post('/api/kernels/(.*)/interrupt', async (req, kernelId: string) => {
      const kernel = activeKernels.get(kernelId);
      if (kernel) {
        try {
          await kernel.interrupt();
          return new Response(null, { status: 204 });
        } catch (error) {
          console.error('Failed to interrupt kernel:', error);
          return new Response('Failed to interrupt kernel', { status: 500 });
        }
      }
      return new Response('Kernel not found', { status: 404 });
    });

    kernelspecs.register({
      spec: {
        name: 'embedded',
        display_name: 'Embedded Kernel',
        language: 'python',
        argv: [],
        resources: {
          'logo-32x32': 'https://acceleratingvector.com/flame.svg',
          'logo-64x64': 'https://acceleratingvector.com/flame.svg',
        },
      },
      create: async (options: IKernel.IOptions): Promise<IKernel> => {

        console.log("CREATED NEW EMBEDDED KERNEL...")
        const serviceContainer = new ServiceContainer(devService);
        await serviceContainer.init();

        // Save the DeviceService instance so we can restore it if kernel is restarted
        devService = serviceContainer.deviceService;

        const welcomePanel = new WelcomePanel(
          serviceContainer,
          app
        );
        document.body.appendChild(welcomePanel.getElement());
        const kernel = new EmbeddedKernel(options, serviceContainer);

        // welcomePanel.show();
        welcomePanel.initialShow();

        // If the deivce is already connected, update the welcome panel
        if (serviceContainer.deviceService.isConnected()) { 
          welcomePanel.updateOnConnection("Connected");
        }
        
        await kernel.ready;

        activeKernels.set(kernel.id, kernel);

        return kernel;
      }
    });
  }
};

export default [kernelPlugin];
export {frontendPlugin, notebookTracker};