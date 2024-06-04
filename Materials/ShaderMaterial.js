import { vec4 } from 'gl-matrix';
import { Material } from './Material.js';
import { Renderer } from '../Renderer.js';
import { makeShaderDataDefinitions, makeStructuredView} from 'webgpu-utils';

export class ShaderMaterial extends Material {
    static pipelines = {};
    static bindGroupLayout = null;
    static colorBuffer = null;
    static count = 0;

    constructor(options) {
        super();
        this.id = this.constructor.count++;
        this.color = options.color || vec4.fromValues(1, 1, 1, 1);
        this.shader = options.shader;
        this.uniforms = options.uniforms;
    }

    init(options){
        this.topology = options.wireframe ? 'line-list' : 'triangle-list';
        if(!this.constructor.bindGroupLayout){
            this.constructor.bindGroupLayout = this.createBindGroupLayout();
        }
        this.createMaterialBuffers();
        this.createBindGroup();
        if(!this.constructor.pipelines[this.shader]){
            this.constructor.pipelines[this.shader] = {};
        }
        if(!this.constructor.pipelines[this.shader][this.topology]){
            this.constructor.pipelines[this.shader][this.topology] = this.createPipeline(options);
        }
    }

    updateMaterialBuffers(){
        this.createMaterialBuffers();
        this.createBindGroup();
    }

    updateUniformBuffer(){
        this.uniformValues.set(this.uniforms);
        Renderer.instance.getDevice().queue.writeBuffer(this.uniformBuffer, 0, this.uniformValues.arrayBuffer);
    }

    createMaterialBuffers(){
        const defs = makeShaderDataDefinitions(this.shader);
        this.uniformValues = makeStructuredView(defs.uniforms.uniforms);
        this.uniformBuffer = Renderer.instance.getDevice().createBuffer({
            size: this.uniformValues.arrayBuffer.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        this.uniformValues.set(this.uniforms);
        Renderer.instance.getDevice().queue.writeBuffer(this.uniformBuffer, 0, this.uniformValues.arrayBuffer);
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
                }
            ]
        });

        return bindGroupLayout;
    }

    createPipeline(options){
        const pipelineLayout = Renderer.instance.getDevice().createPipelineLayout({
            bindGroupLayouts: [this.constructor.bindGroupLayout]
        })

        const shaderModule = Renderer.instance.getDevice().createShaderModule({ code: this.shader });
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
        return this.constructor.pipelines[this.shader][topology];
    }
}