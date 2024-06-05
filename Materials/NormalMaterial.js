import { vec4 } from 'gl-matrix';
import { Material } from './Material.js';
import { Renderer } from '../Core/Renderer.js';
import basicMaterialShader from './shaders/normalMaterialShader.wgsl?raw';

export class NormalMaterial extends Material {
    static pipelines = {};
    static bindGroupLayout = null;
    static count = 0;

    constructor(options) {
        super();
        this.id = this.constructor.count++;
        this.color = options.color ? options.color : vec4.fromValues(1, 0, 0, 1);
    }

    init(options){
        this.topology = options.wireframe ? 'line-list' : 'triangle-list';
        if(!this.constructor.bindGroupLayout){
            this.constructor.bindGroupLayout = this.createBindGroupLayout();
        }
        if(!this.constructor.pipelines[this.topology]){
            this.constructor.pipelines[this.topology] = this.createPipeline(options);
        }
        this.createMaterialBuffers();
        this.createBindGroup();
    }

    createMaterialBuffers(){

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
                }
            ]
        });

        return bindGroupLayout;
    }

    createPipeline(options){
        const pipelineLayout = Renderer.instance.getDevice().createPipelineLayout({
            bindGroupLayouts: [this.constructor.bindGroupLayout]
        })

        const shaderModule = Renderer.instance.getDevice().createShaderModule({ code: basicMaterialShader });
        const pipeline = Renderer.instance.getDevice().createRenderPipeline({
            label: this.constructor.name + '-material-pipeline',
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