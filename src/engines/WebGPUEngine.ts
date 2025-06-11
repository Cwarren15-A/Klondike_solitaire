export class WebGPUEngine {
  private device: GPUDevice | null = null;
  private context: GPUCanvasContext;
  private renderPipeline: GPURenderPipeline | null = null;
  private cardPipeline: GPURenderPipeline | null = null;
  private particlePipeline: GPURenderPipeline | null = null;
  private uniformBuffer: GPUBuffer | null = null;
  private vertexBuffer: GPUBuffer | null = null;
  private indexBuffer: GPUBuffer | null = null;

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

      // Create pipelines
      this.renderPipeline = await this.createRenderPipeline();
      this.cardPipeline = await this.createCardPipeline();
      this.particlePipeline = await this.createParticlePipeline();

      // Create buffers
      this.createBuffers();
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
        struct Uniforms {
          modelViewProjection: mat4x4<f32>,
          lightPosition: vec3<f32>,
          ambientLight: vec3<f32>,
        };
        @binding(0) @group(0) var<uniform> uniforms: Uniforms;

        struct VertexOutput {
          @builtin(position) position: vec4<f32>,
          @location(0) normal: vec3<f32>,
          @location(1) worldPosition: vec3<f32>,
        };

        @vertex
        fn vertexMain(
          @location(0) position: vec3<f32>,
          @location(1) normal: vec3<f32>,
        ) -> VertexOutput {
          var output: VertexOutput;
          output.position = uniforms.modelViewProjection * vec4<f32>(position, 1.0);
          output.normal = normal;
          output.worldPosition = position;
          return output;
        }

        @fragment
        fn fragmentMain(input: VertexOutput) -> @location(0) vec4<f32> {
          let lightDir = normalize(uniforms.lightPosition - input.worldPosition);
          let diffuse = max(dot(input.normal, lightDir), 0.0);
          let color = vec3<f32>(1.0, 1.0, 1.0) * (diffuse + uniforms.ambientLight);
          return vec4<f32>(color, 1.0);
        }
      `,
    });

    return this.device.createRenderPipeline({
      layout: 'auto',
      vertex: {
        module: shaderModule,
        entryPoint: 'vertexMain',
        buffers: [{
          arrayStride: 24,
          attributes: [
            { format: 'float32x3', offset: 0, shaderLocation: 0 },
            { format: 'float32x3', offset: 12, shaderLocation: 1 },
          ],
        }],
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
        cullMode: 'back',
      },
      depthStencil: {
        depthWriteEnabled: true,
        depthCompare: 'less',
        format: 'depth24plus',
      },
    });
  }

  private async createCardPipeline(): Promise<GPURenderPipeline> {
    // Similar to createRenderPipeline but with card-specific shaders
    // Implementation details omitted for brevity
    return this.device!.createRenderPipeline({
      // ... card-specific pipeline configuration
    });
  }

  private async createParticlePipeline(): Promise<GPURenderPipeline> {
    // Similar to createRenderPipeline but with particle-specific shaders
    // Implementation details omitted for brevity
    return this.device!.createRenderPipeline({
      // ... particle-specific pipeline configuration
    });
  }

  private createBuffers(): void {
    if (!this.device) return;

    // Create uniform buffer
    this.uniformBuffer = this.device.createBuffer({
      size: 64, // Size of mat4x4
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    // Create vertex buffer
    this.vertexBuffer = this.device.createBuffer({
      size: 1024, // Adjust size as needed
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });

    // Create index buffer
    this.indexBuffer = this.device.createBuffer({
      size: 1024, // Adjust size as needed
      usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
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
      depthStencilAttachment: {
        view: this.createDepthTexture().createView(),
        depthClearValue: 1.0,
        depthLoadOp: 'clear',
        depthStoreOp: 'store',
      },
    });

    // Render main scene
    renderPass.setPipeline(this.renderPipeline);
    renderPass.setVertexBuffer(0, this.vertexBuffer!);
    renderPass.setIndexBuffer(this.indexBuffer!, 'uint32');
    renderPass.drawIndexed(36, 1, 0, 0, 0);

    // Render cards
    if (this.cardPipeline) {
      renderPass.setPipeline(this.cardPipeline);
      // ... card rendering logic
    }

    // Render particles
    if (this.particlePipeline) {
      renderPass.setPipeline(this.particlePipeline);
      // ... particle rendering logic
    }

    renderPass.end();
    this.device.queue.submit([commandEncoder.finish()]);
  }

  private createDepthTexture(): GPUTexture {
    if (!this.device) throw new Error('Device not initialized');
    
    return this.device.createTexture({
      size: [this.context.canvas.width, this.context.canvas.height],
      format: 'depth24plus',
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
  }

  cleanup(): void {
    if (this.device) {
      this.uniformBuffer?.destroy();
      this.vertexBuffer?.destroy();
      this.indexBuffer?.destroy();
      (this.device as any).destroy?.();
    }
    this.device = null;
    this.renderPipeline = null;
    this.cardPipeline = null;
    this.particlePipeline = null;
  }
} 