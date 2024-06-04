import { Scene } from "./Scene";
import { BasicTriangle } from "./BasicTriangle";

export class BasicTriangleRenderer {
    static instance;

    constructor(canavs) {

        if (BasicTriangleRenderer.instance) {
            return BasicTriangleRenderer.instance;
        }

        this.canvas = canavs;
        this.gpu = null;
        this.adapter = null;
        this.device = null;
        this.context = null;
        this.commandBuffers = [];
        this.renderFuncrions = [];

        BasicTriangleRenderer.instance = this;
    }

    async init() {

        //Checks to see if WebGPU is available
        if (!("gpu" in window.navigator)) {
            console.log("gpu not in navigator");
            return false;
        }
        this.gpu = navigator.gpu;

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

    getDevice() {
        return this.device;
    }

    render(scene) {
        if (!(scene instanceof Scene)) {
            throw new TypeError('render must take in a Scene object');
        }

        const commandEncoder = this.device.createCommandEncoder();
        const renderPassDescriptor = {
            colorAttachments: [
                {
                    loadOp: "clear",
                    clearValue: { r: 0, g: 0, b: 0, a: 1 },
                    storeOp: "store"
                }
            ]
        }
        renderPassDescriptor.colorAttachments[0].view = this.context.getCurrentTexture().createView();
        const renderPass = commandEncoder.beginRenderPass(renderPassDescriptor);

        scene.objects.forEach(element => {
            this.renderObject(renderPass, element);
        });

        renderPass.end();
        this.device.queue.submit([commandEncoder.finish()]);
    }

    renderObject(renderPass, element) {
        switch (element.constructor) {
            case BasicTriangle:
                this.renderBasicTriangle(renderPass, element);
                break;
            default:
                console.log("non renderable object in scene");
        }
    }

    renderBasicTriangle(renderPass, triangle) {
        renderPass.setPipeline(triangle.pipeline);
        renderPass.setVertexBuffer(0, triangle.vertexBuffer);
        renderPass.draw(3);
    }

    
}