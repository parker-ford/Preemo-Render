import { Scene } from "./Scene";
import { Renderable } from "./Renderable.js";
import { Light } from "../Lights/Light.js";
import { SkyBox } from "./SkyBox.js";

export class Renderer {

    static instance;
    static drawnObjects = 0;

    constructor(canavs) {

        if (Renderer.instance) {
            return Renderer.instance;
        }

        this.canvas = canavs;
        this.gpu = null;
        this.adapter = null;
        this.device = null;
        this.context = null;
        this.commandBuffers = [];
        this.renderFuncrions = [];
        this.viewLightHelpers = false;
        
        //DEBUGGING
        this.printOD = true;
        this.printLightBuffer = true;

        Renderer.instance = this;
    }

    async setupDevice() {
        //Checks to see if WebGPU is available
        if (!("gpu" in window.navigator)) {
            console.log("gpu not in navigator");
            return false;
        }
        this.gpu = navigator.gpu;
        console.log(window.navigator);
        //The adapter represents the physicsal gpu device.
        //This method can not fail but it may be null.
        this.adapter = await this.gpu.requestAdapter();
        if (!this.adapter) {
            console.log("no adapter");
            return false;
        }

        //This is the logical connection of the gpu. It allows you to create thins like buffers and textures.
        this.device = await this.adapter.requestDevice();
        if (!this.device) {
            console.log("no device");
            return false;
        }

        this.context = this.canvas.getContext('webgpu');
        this.devicePixelRatio = window.devicePixelRatio || 1;
        this.presentationSize = [this.canvas.clientWidth * devicePixelRatio, this.canvas.clientHeight * devicePixelRatio];
        this.presentationFormat = this.gpu.getPreferredCanvasFormat();
        let configuration = {
            device: this.device,
            format: this.presentationFormat,
            size: this.presentationSize,
        };
        this.context.configure(configuration);

        return true;
    }

    setupDepthStencil() {
        this.depthStencilState = {
            format: 'depth24plus-stencil8',
            depthWriteEnabled: true,
            depthCompare: 'less-equal',
        }
        
        const size = {
            width: this.canvas.width,
            height: this.canvas.height,
            depthOrArrayLayers: 1,
        }

        const depthBufferDescriptor = {
            size: size,
            format: this.depthStencilState.format,
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        }

        this.depthStencilBuffer = this.device.createTexture(depthBufferDescriptor);

        const viewDescriptor = {
            format: this.depthStencilState.format,
            dimension: '2d',
            aspect: 'all',
        }
        this.depthStencilView = this.depthStencilBuffer.createView(viewDescriptor);

        this.depthStencilAttachment = {
            view: this.depthStencilView,
            depthClearValue: 1.0,
            depthLoadOp: 'clear',
            depthStoreOp: 'store',
            stencilLoadOp: 'clear',
            stencilStoreOp: 'discard',
        }
    }

    setupBuffers(){

        this.objectsBuffer = this.device.createBuffer({
            size: 64 * 2 * 1024,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        });

        this.uniformBuffer = this.device.createBuffer({
            size: 64 * 2,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        this.lightBuffer = this.device.createBuffer({
            size: 80 * 16,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        });
    }

    async init() {

        if(!await this.setupDevice()){
            console.log("device setup failed");
            return false;
        }

        this.setupDepthStencil();
        this.setupBuffers();

        return true;
    }

    getDevice() {
        return this.device;
    }
    
    render(scene, camera) {
        if (!(scene instanceof Scene)) {
            throw new TypeError('render must take in a Scene object');
        }

        Renderer.drawnObjects = 0;

        //Update everything in the scene
        scene.update();

        //Model, View, Projection Matrices
        this.device.queue.writeBuffer(this.objectsBuffer, 0, scene.object_data, 0, scene.object_data.length);
        this.device.queue.writeBuffer(this.uniformBuffer, 0, camera.viewMatrix);
        this.device.queue.writeBuffer(this.uniformBuffer, 64, camera.projectionMatrix);

        //Light Data
        let clearBuffer = new ArrayBuffer(this.lightBuffer.size);
        this.device.queue.writeBuffer(this.lightBuffer, 0, clearBuffer);
        this.device.queue.writeBuffer(this.lightBuffer, 0, scene.light_data, 0, scene.light_data.byteLength);

        const commandEncoder = this.device.createCommandEncoder();
        const renderPassDescriptor = {
            colorAttachments: [
                {
                    loadOp: "clear",
                    clearValue: { r: 0, g: 0, b: 0, a: 1 },
                    storeOp: "store"
                }
            ],
            depthStencilAttachment: this.depthStencilAttachment,
        }
        renderPassDescriptor.colorAttachments[0].view = this.context.getCurrentTexture().createView();
        const renderPass = commandEncoder.beginRenderPass(renderPassDescriptor);

        //Render SkyBox
        if(scene.skyBox){
            this.renderSkyBox(renderPass, scene.skyBox);
        }

        //Render Objects
        scene.objects.forEach(element => {
            this.renderObject(renderPass, element);
        });

        renderPass.end();
        this.device.queue.submit([commandEncoder.finish()]);
    }

    renderObject(renderPass, element) {
        if(element instanceof Renderable){
            this.renderRenderable(renderPass, element);
        }
        else if(element instanceof Light){
            this.renderLightHelpers(renderPass, element);
        }
        // else if(element instanceof SkyBox){
        //     this.renderSkyBox(renderPass, element);
        // }
        else{
            // console.log("non renderable object in scene: " + element.constructor.name);
        }
    }

    renderSkyBox(renderPass, element) {
        renderPass.setPipeline(element.material.getPipeline());
        renderPass.setVertexBuffer(0, element.mesh.vertexBuffer);
        renderPass.setBindGroup(0, element.material.bindGroup);
        renderPass.draw(36)
        // Renderer.drawnObjects++;
    }

    renderRenderable(renderPass, element) {
        renderPass.setPipeline(element.material.getPipeline(element.material.topology));
        renderPass.setVertexBuffer(0, element.mesh.vertexBuffer);
        renderPass.setBindGroup(0, element.material.bindGroup);
        renderPass.draw(element.mesh.getVertexCount(), 1, 0, Renderer.drawnObjects)
        Renderer.drawnObjects++;
    }

    renderLightHelpers(renderPass, element) {
        if(this.viewLightHelpers){
            renderPass.setPipeline(element.material.getPipeline(element.material.topology));
            renderPass.setVertexBuffer(0, element.mesh.vertexBuffer);
            renderPass.setBindGroup(0, element.material.bindGroup);
            renderPass.draw(element.mesh.getVertexCount(), 1, 0, Renderer.drawnObjects)
        }
        Renderer.drawnObjects++;
    }
}