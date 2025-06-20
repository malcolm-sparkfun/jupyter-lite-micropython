import { JupyterLiteServer, JupyterLiteServerPlugin } from '@jupyterlite/server';
import { IKernel, IKernelSpecs } from '@jupyterlite/kernel';
import { INotebookTracker } from '@jupyterlab/notebook';
import { EmbeddedKernel } from './kernel';
import WelcomePanel from './panel';
import { ServiceContainer } from './services/ServiceContainer';
import { DeviceService } from './services/DeviceService';

var devService: DeviceService | null = null;

const kernelPlugin: JupyterLiteServerPlugin<void> = {
  id: 'jupyterlite-embedded-kernel:kernel',
  autoStart: true,
  requires: [IKernelSpecs, INotebookTracker], // Add INotebookTracker here
  activate: (
    app: JupyterLiteServer,
    kernelspecs: IKernelSpecs,
    notebookTracker: INotebookTracker // Add notebookTracker parameter
  ) => {
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

        devService = serviceContainer.deviceService;

        const welcomePanel = new WelcomePanel(
          serviceContainer,
          notebookTracker // Pass notebookTracker here
        );
        document.body.appendChild(welcomePanel.getElement());
        const kernel = new EmbeddedKernel(options, serviceContainer);

        welcomePanel.initialShow();

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
