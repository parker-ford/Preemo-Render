import { mat4 } from "gl-matrix";
import { Renderer } from '../Core/Renderer.js';
import shader from './shaders/projectionShadowShader.wgsl?raw';

export class ProjectionShadow {
    static pipeline = null;
    static bindGroupLayout = null;
    static count = 0;

    constructor(options) {
        this.recieverPlane = options.recieverPlane || null;
        this.lightPosition = options.lightPosition;
        this.isDirectional = options.isDirectional || false;
        this.shadowProjectionMatrix = mat4.create();
        this.id = this.constructor.count++;
        if(!this.constructor.bindGroupLayout){
            this.constructor.bindGroupLayout = this.createBindGroupLayout();
        }
        this.createUniformBuffer();
        this.createBindGroup();
        if(!this.constructor.pipeline){
            this.constructor.pipeline = this.createPipeline(options);
        }

        this.print = true;
        console.log(this.isDirectional)
    }

    updateUniformBuffer(){
        this.setShadowProjectionMatrix();
        this.createUniformBuffer();
        this.createBindGroup();
    }

    setShadowProjectionMatrix(){
        // if(!this.lightPosition){
        //     return;
        // }

        if(this.isDirectional){
            this.shadowProjectionMatrix[0] = 1;
            this.shadowProjectionMatrix[1] = -(this.lightPosition[0] / this.lightPosition[1]);
            this.shadowProjectionMatrix[5] = 0;
            this.shadowProjectionMatrix[9] = -(this.lightPosition[2] / this.lightPosition[1]);
        }
        else{
            this.shadowProjectionMatrix[0] = this.lightPosition[1];
            this.shadowProjectionMatrix[1] = -this.lightPosition[0];
            this.shadowProjectionMatrix[5] = 0;
            this.shadowProjectionMatrix[9] = -this.lightPosition[2];
            this.shadowProjectionMatrix[10] = this.lightPosition[1];
            this.shadowProjectionMatrix[13] = -1;
            this.shadowProjectionMatrix[15] = this.lightPosition[1];
        }




        // this.shadowProjectionMatrix[1] = 1;
        // this.shadowProjectionMatrix[5] = 0;

        // if(this.print){
        //     console.log([
        //         this.shadowProjectionMatrix.slice(0, 4),
        //         this.shadowProjectionMatrix.slice(4, 8),
        //         this.shadowProjectionMatrix.slice(8, 12),
        //         this.shadowProjectionMatrix.slice(12, 16)
        //     ].map(row => row.join('\t')).join('\n'));
        //     this.print = false;
        // }

    }

    createUniformBuffer(){
        // this.uniformBuffer = Renderer.instance.getDevice().createBuffer({
        //     label: this.constructor.name + '-uniform-buffer' + this.id,
        //     size:12,
        //     usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        // });
        // Renderer.instance.getDevice().queue.writeBuffer(this.uniformBuffer, 0, this.recieverPlane.transform.forward);
        const shadowRecieverDataValues = new ArrayBuffer(32);
        const shadowRecieverDataViews = {
        recieverNormal: new Float32Array(shadowRecieverDataValues, 0, 3),
        recieverPosition: new Float32Array(shadowRecieverDataValues, 16, 3),
        };

        if(this.print){
            console.log(this.recieverPlane)
            this.print = false;
        }

        shadowRecieverDataViews.recieverNormal.set(this.recieverPlane.transform.forward);
        shadowRecieverDataViews.recieverPosition.set(this.recieverPlane.transform.position);

        this.uniformBuffer = Renderer.instance.getDevice().createBuffer({
            label: this.constructor.name + '-uniform-buffer' + this.id,
            size: shadowRecieverDataValues.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        Renderer.instance.getDevice().queue.writeBuffer(this.uniformBuffer, 0, shadowRecieverDataValues);
    }

    createBindGroupLayout() {
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
                    visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                    buffer: {type: 'uniform'}
                },
                {
                    binding: 3,
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
                topology: 'triangle-list',
            },
            
            depthStencil: Renderer.instance.depthStencilState,
        });

        return pipeline;
    }

    getPipeline(){
        return this.constructor.pipeline;
    }
}