export class WebGPUEngine {
  private device: GPUDevice | null = null;
  private context: GPUCanvasContext;
  private renderPipeline: GPURenderPipeline | null = null;

  constructor(context: GPUCanvasContext) {
    this.context = context;
  }

  async initialize(): Promise<void> {
    try {
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) {
        throw new Error('No WebGPU adapter found');
      }

      const device = await adapter.requestDevice();
      if (!device) {
        throw new Error('Failed to get WebGPU device');
      }

      this.device = device as unknown as GPUDevice;

      // Configure the context
      const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
      this.context.configure({
        device: this.device,
        format: canvasFormat,
        alphaMode: 'premultiplied',
      });

      // Create render pipeline
      this.renderPipeline = await this.createRenderPipeline();
    } catch (error) {
      console.error('Failed to initialize WebGPU:', error);
      throw error;
    }
  }

  private async createRenderPipeline(): Promise<GPURenderPipeline> {
    if (!this.device) {
      throw new Error('Device not initialized');
    }

    const shaderModule = this.device.createShaderModule({
      code: `
        @vertex
        fn vertexMain(@builtin(vertex_index) vertexIndex: u32) -> @builtin(position) vec4<f32> {
          var pos = array<vec2<f32>, 3>(
            vec2<f32>(0.0, 0.5),
            vec2<f32>(-0.5, -0.5),
            vec2<f32>(0.5, -0.5)
          );
          return vec4<f32>(pos[vertexIndex], 0.0, 1.0);
        }

        @fragment
        fn fragmentMain() -> @location(0) vec4<f32> {
          return vec4<f32>(1.0, 0.0, 0.0, 1.0);
        }
      `,
    });

    return this.device.createRenderPipeline({
      layout: 'auto',
      vertex: {
        module: shaderModule,
        entryPoint: 'vertexMain',
      },
      fragment: {
        module: shaderModule,
        entryPoint: 'fragmentMain',
        targets: [{
          format: navigator.gpu.getPreferredCanvasFormat(),
        }],
      },
      primitive: {
        topology: 'triangle-list',
      },
    });
  }

  render(): void {
    if (!this.device || !this.renderPipeline) {
      console.warn('WebGPU not initialized');
      return;
    }

    const commandEncoder = this.device.createCommandEncoder();
    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [{
        view: this.context.getCurrentTexture().createView(),
        clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
        loadOp: 'clear',
        storeOp: 'store',
      }],
    });

    renderPass.setPipeline(this.renderPipeline);
    renderPass.draw(3, 1, 0, 0);
    renderPass.end();

    this.device.queue.submit([commandEncoder.finish()]);
  }

  cleanup(): void {
    if (this.device) {
      (this.device as any).destroy?.();
    }
    this.device = null;
    this.renderPipeline = null;
  }
} 