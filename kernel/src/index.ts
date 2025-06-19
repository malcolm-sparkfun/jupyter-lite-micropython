// Removed Widget import as we're no longer using @lumino/widgets
import { JupyterLiteServer, JupyterLiteServerPlugin } from '@jupyterlite/server';
import { IKernel, IKernelSpecs } from '@jupyterlite/kernel';
// import { INotebookTracker, NotebookPanel } from '@jupyterlab/notebook';
import { EmbeddedKernel } from './kernel';
import WelcomePanel from './panel';
import { ServiceContainer } from './services/ServiceContainer';
import { DeviceService } from './services/DeviceService';

// Variable for saving the DeviceService instance so we can restore it if kernel is restarted 
var devService: DeviceService | null = null;

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

    // notebookTracker.currentChanged.connect((tracker, panel: NotebookPanel | null) => {
    //   if (panel) {
    //     console.log("Notebook changed to: ", panel.context.path);
    //     const currentNotebookPanel = notebookTracker.currentWidget;
        

    //   }
    //   else{
    //     console.log("No notebook currently active on currentChanged event.")
    //   }
    // });
  }
};

export default [kernelPlugin];
