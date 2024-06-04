import { Mesh } from './Mesh.js';

export class LineGizmoMesh extends Mesh {
    constructor(options){
        super(options);
        this.distance = 1;
        this.wireframe = true;
        this.calculateVertices();
        this.setupVertexBuffer();
    }

    calculateVertices(){
        this.calculateVertexCoordinates();
        this.calculateTriangleVertices();
        this.calculateLineVertices();
    }

    updateGizmo(){
        this.calculateVertices();
        this.setupVertexBuffer();
    }

    calculateVertexCoordinates(){
        this.vertexCoordinates = [];
        this.vertexCoordinates.push([0,1,0]);
        this.vertexCoordinates.push([0,-1,0])
        
    }

    calculateTriangleVertices(){
        this.triangleVertices = new Float32Array();
        this.triangleUVs = new Float32Array();
        this.triangleNormals = new Float32Array();
    }

    calculateLineVertices(){
        let lines = [];
        lines.push(this.vertexCoordinates[0]);
        lines.push(this.vertexCoordinates[1]);

        this.lineVertices = new Float32Array(lines.flat());
        this.lineUVs = new Float32Array(
            Array(lines.length * 2).fill(1.0)
        );
        this.lineNormals = new Float32Array(
            Array(lines.length * 3).fill(1.0)
        );
    }
}