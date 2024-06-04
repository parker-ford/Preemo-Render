import { BasicTriangleRenderer } from './BasicTriangleRenderer.js';

export class BasicTriangle {
    constructor(options) {
        this.points = new Float32Array(options.points.flat());
        this.colors = new Float32Array(options.colors.flat());
        this.indices = new Uint32Array([0, 1, 2]);
        this.shader = options.shader;
        this.constructBuffers();
        this.setupShaders();
        this.frame();
    }

    constructBuffers() {

        this.setVertexBuffer();

        this.vertexBufferDescriptors = [
            {
                attributes: [
                    {
                        shaderLocation: 0,
                        offset: 0,
                        format: "float32x4"
                    },
                    {
                        shaderLocation: 1,
                        offset: 16,
                        format: "float32x4"
                    },
                ],
                arrayStride: 32,
                stepMode: "vertex",
            }
        ];

    }
    
    setVertexBuffer(){
        let vertexData = new Float32Array(this.points.length + this.colors.length);
        for (let i = 0, j = 0; i < this.points.length; i += 4, j += 8) {
            vertexData.set(this.points.subarray(i, i + 4), j);
            vertexData.set(this.colors.subarray(i, i + 4), j + 4);
        }

        this.vertexBuffer = BasicTriangleRenderer.instance.getDevice().createBuffer({
            size: vertexData.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true
        });

        new Float32Array(this.vertexBuffer.getMappedRange()).set(vertexData);
        this.vertexBuffer.unmap();
    }

    setupShaders() {
        this.shaderModule = BasicTriangleRenderer.instance.getDevice().createShaderModule({ code: this.shader });
        this.pipeline = BasicTriangleRenderer.instance.getDevice().createRenderPipeline({
            layout: 'auto',
            vertex: {
                module: this.shaderModule,
                entryPoint: "vertex_main",
                buffers: this.vertexBufferDescriptors
            },
            fragment: {
                module: this.shaderModule,
                entryPoint: "fragment_main",
                targets: [
                    { format: BasicTriangleRenderer.instance.presentationFormat }
                ],
                primitive: {
                    topology: 'triangle-list',
                }
            }
        });
    }

    frame(){
        
        this.setVertexBuffer();

        requestAnimationFrame(this.frame.bind(this));
    }
}