import { BasicTransformRenderer } from './BasicTransformRenderer.js';
import { Transform } from './Transform.js';

export class BasicTriangleTransform {
    constructor(options) {
        this.indices = new Uint32Array([0, 1, 2]);
        this.transform = new Transform({});
        this.points = new Float32Array(
            [
                [-0.25, -0.5 * Math.sqrt(3) / 4, 0.0, 1.0],
                [0, 0.5 * Math.sqrt(3) / 4, 0.0, 1.0],
                [0.25, -0.5 * Math.sqrt(3) / 4, 0.0, 1.0]
            ].flat()
        );
        this.colors = new Float32Array(
            [
                [1.0, 0.0, 0.0, 1.0], 
                [0.0, 1.0, 0.0, 1.0], 
                [0.0, 0.0, 1.0, 1.0]
            ].flat()
        )

        this.constructBuffers();
    }

    constructBuffers() {

        this.setVertexBuffer();
    }
    
    setVertexBuffer(){
        let vertexData = new Float32Array(this.points.length + this.colors.length);
        for (let i = 0, j = 0; i < this.points.length; i += 4, j += 8) {
            vertexData.set(this.points.subarray(i, i + 4), j);
            vertexData.set(this.colors.subarray(i, i + 4), j + 4);
        }

        this.vertexBuffer = BasicTransformRenderer.instance.getDevice().createBuffer({
            size: vertexData.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true
        });

        new Float32Array(this.vertexBuffer.getMappedRange()).set(vertexData);
        this.vertexBuffer.unmap();
    }


    update(){
        this.transform.update();
    }
}