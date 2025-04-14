// Removed Widget import as we're no longer using @lumino/widgets
import { JupyterLiteServer, JupyterLiteServerPlugin } from '@jupyterlite/server';
import { IKernel, IKernelSpecs } from '@jupyterlite/kernel';
import { EmbeddedKernel } from './kernel';
import WelcomePanel from './panel';
import { ServiceContainer } from './services/ServiceContainer';

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

        const serviceContainer = new ServiceContainer()

        const welcomePanel = new WelcomePanel(serviceContainer);
        document.body.appendChild(welcomePanel.getElement());
        const kernel = new EmbeddedKernel(options, serviceContainer);

        welcomePanel.show();
        await kernel.ready;

        activeKernels.set(kernel.id, kernel);
        return kernel;
      }
    });
  }
};

export default [kernelPlugin];
