import {Renderer} from "../Renderer"

export class Mesh {
    constructor(options){
        this.vertices = null; // vertices will be assigned in subclasses
        this.vertexBuffer = null; // vertexBuffer will be assigned in subclasses

        this.triangleVertices = null;
        this.triangleColors = null;
        this.triangleUVs = null;
        this.triangleNormals = null;

        this.lineVertices = null;
        this.lineColors = null;
        this.lineUVs = null;
        this.lineNormals = null;

        this.vertexCoordinates = null;
        this.wireframe = options.wireframe || false;
    }
    
    //Will add additional vertex data such as normals, uvs, etc.
    setupVertexBuffer(){

        let vertexData;

        if(this.wireframe == false){
            vertexData = new Float32Array(this.triangleVertices.length + this.triangleUVs.length + this.triangleNormals.length);
            for (let i = 0, vertex = 0, uv = 0, normal = 0; i < vertexData.length; i += 8, vertex += 3, uv += 2, normal += 3) {
                vertexData[i] = this.triangleVertices[vertex];
                vertexData[i + 1] = this.triangleVertices[vertex + 1];
                vertexData[i + 2] = this.triangleVertices[vertex + 2];

                vertexData[i + 3] = this.triangleUVs[uv];
                vertexData[i + 4] = this.triangleUVs[uv + 1];

                vertexData[i + 5] = this.triangleNormals[normal];
                vertexData[i + 6] = this.triangleNormals[normal + 1];
                vertexData[i + 7] = this.triangleNormals[normal + 2];
            }
        }
        else{
            vertexData = new Float32Array(this.lineVertices.length + this.lineUVs.length + this.lineNormals.length);

            for (let i = 0, vertex = 0, uv = 0, normal = 0; i < vertexData.length; i += 8, vertex += 3, uv += 2, normal += 3) {
                vertexData[i] = this.lineVertices[vertex];
                vertexData[i + 1] = this.lineVertices[vertex + 1];
                vertexData[i + 2] = this.lineVertices[vertex + 2];

                vertexData[i + 3] = this.lineUVs[uv];
                vertexData[i + 4] = this.lineUVs[uv + 1];

                vertexData[i + 5] = this.lineNormals[normal];
                vertexData[i + 6] = this.lineNormals[normal + 1];
                vertexData[i + 7] = this.lineNormals[normal + 2];
            }
        }
        
        this.vertexBuffer = Renderer.instance.getDevice().createBuffer({
            size: vertexData.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true
        });
        new Float32Array(this.vertexBuffer.getMappedRange()).set(vertexData);
        this.vertexBuffer.unmap();


        this.vertexBufferDescriptors = [
            {
                attributes: [
                    //Vertex Position
                    {
                        shaderLocation: 0,
                        offset: 0,
                        format: "float32x3"
                    },
                    //Vertex UV
                    {
                        shaderLocation: 1,
                        offset: 12,
                        format: "float32x2"
                    },
                    //Vertex Normal
                    {
                        shaderLocation: 2,
                        offset: 20,
                        format: "float32x3"
                    }
                ],
                arrayStride: 32,
                stepMode: "vertex",
            }
        ];
    }

    getVertexCount(){
        return this.wireframe ? this.lineVertices.length / 3: this.triangleVertices.length / 3;
    }

}