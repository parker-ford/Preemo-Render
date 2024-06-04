import { vec4 } from 'gl-matrix';
import { Material } from './Material.js';
import { Renderer } from '../Renderer.js';
import shader from './shaders/cubeMapShader.wgsl?raw';
import { Texture } from '../Texture.js';

export class CubeMapMaterial extends Material {
    static pipelines = {};
    static bindGroupLayout = null;
    static colorBuffer = null;
    static count = 0;

    constructor(options) {
        super();
        this.id = this.constructor.count++;
        this.color = options.color || vec4.fromValues(1, 1, 1, 1);
        this.ambient = options.ambient || 0.5;
        this.tiling = options.tiling || 1;
        this.offset = options.offset || 0;
        this.texture = options.texture || Texture.getDefaultTexture();
    }

    init(options){
        this.topology = options.wireframe ? 'line-list' : 'triangle-list';
        if(!this.constructor.bindGroupLayout){
            this.constructor.bindGroupLayout = this.createBindGroupLayout();
        }
        //this.createTexture();
        this.createMaterialBuffers();
        this.createBindGroup();
        if(!this.constructor.pipelines[this.topology]){
            this.constructor.pipelines[this.topology] = this.createPipeline(options);
        }
    }

    updateMaterialBuffers(){
        this.createMaterialBuffers();
        this.createBindGroup();
    }

    createMaterialBuffers(){

        const UniformsValues = new ArrayBuffer(32);
        const UniformsViews = {
            color: new Float32Array(UniformsValues, 0, 4),
            ambient: new Float32Array(UniformsValues, 16, 1),
            tiling: new Float32Array(UniformsValues, 20, 1),
            offset: new Float32Array(UniformsValues, 24, 1),
        };
        UniformsViews.color.set(this.color);
        UniformsViews.ambient[0] = this.ambient;
        UniformsViews.tiling[0] = this.tiling;
        UniformsViews.offset[0] = this.offset;
        
        this.uniformBuffer = Renderer.instance.getDevice().createBuffer({
            label: this.constructor.name + '-uniform-buffer' + this.id,
            size: UniformsValues.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        Renderer.instance.getDevice().queue.writeBuffer(this.uniformBuffer, 0, UniformsValues);
    }

    createBindGroup(){
        this.bindGroup = Renderer.instance.getDevice().createBindGroup({
            label: this.constructor.name + '-bind-group' + this.id,
            layout: this.constructor.bindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: Renderer.instance.uniformBuffer
                    }
                },
                {
                    binding: 1,
                    resource: {
                        buffer: Renderer.instance.objectsBuffer
                    }
                },
                {
                    binding: 2,
                    resource: {
                        buffer: this.uniformBuffer
                    }
                },
                {
                    binding: 3,
                    resource: {
                        buffer: Renderer.instance.lightBuffer
                    }
                },
                {
                    binding: 4,
                    resource: this.texture.sampler
                },
                {
                    binding: 5,
                    resource: this.texture.textureView
                }
            ]
        });
    }

    createBindGroupLayout(){
        const bindGroupLayout = Renderer.instance.getDevice().createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {type: 'uniform'}
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {
                        type: 'read-only-storage',
                        hasDynamicOffset: false
                    }
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: {type: 'uniform'}
                },
                {
                    binding: 3,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: {
                        type: 'read-only-storage',
                        hasDynamicOffset: false
                    }
                },
                {
                    binding: 4,
                    visibility: GPUShaderStage.FRAGMENT,
                    sampler: {}
                },
                {
                    binding: 5,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {}
                }
            ]
        });

        return bindGroupLayout;
    }

    createPipeline(options){
        const pipelineLayout = Renderer.instance.getDevice().createPipelineLayout({
            bindGroupLayouts: [this.constructor.bindGroupLayout]
        })

        const shaderModule = Renderer.instance.getDevice().createShaderModule({ code: shader });
        const pipeline = Renderer.instance.getDevice().createRenderPipeline({
            label: this.constructor.name + '-pipeline-' + this.id,
            layout: pipelineLayout,
            vertex: {
                module: shaderModule,
                entryPoint: "vertex_main",
                buffers: options.vertexBufferDescriptors
            },
            fragment: {
                module: shaderModule,
                entryPoint: "fragment_main",
                targets: [
                    { format: Renderer.instance.presentationFormat }
                ],
            },
            primitive: {
                topology: this.topology,
            },
            
            //Depth stencil may need to be per material rather than per renderer
            depthStencil: Renderer.instance.depthStencilState,
        });

        return pipeline;
    }

    getPipeline(topology){
        return this.constructor.pipelines[topology];
    }
}