import { Mesh } from '../Mesh.js';

export class SphereGizmoMesh extends Mesh {
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
        let radius = .1;
        for(let i = 0; i < 45; i++){
            this.vertexCoordinates.push([Math.cos(i * 8 * Math.PI / 180) * radius, Math.sin(i * 8 * Math.PI / 180) * radius, 0]);
        }
        for(let i = 0; i < 45; i++){
            this.vertexCoordinates.push([0, Math.sin(i * 8 * Math.PI / 180) * radius, Math.cos(i * 8 * Math.PI / 180) * radius]);
        }
        for(let i = 0; i < 45; i++){
            this.vertexCoordinates.push([Math.sin(i * 8 * Math.PI / 180) * radius, 0, Math.cos(i * 8 * Math.PI / 180) * radius]);
        }

        radius = this.distance;
        for(let i = 0; i < 45; i++){
            this.vertexCoordinates.push([Math.cos(i * 8 * Math.PI / 180) * radius, Math.sin(i * 8 * Math.PI / 180) * radius, 0]);
        }
        for(let i = 0; i < 45; i++){
            this.vertexCoordinates.push([0, Math.sin(i * 8 * Math.PI / 180) * radius, Math.cos(i * 8 * Math.PI / 180) * radius]);
        }
        for(let i = 0; i < 45; i++){
            this.vertexCoordinates.push([Math.sin(i * 8 * Math.PI / 180) * radius, 0, Math.cos(i * 8 * Math.PI / 180) * radius]);
        }
        
    }

    calculateTriangleVertices(){
        this.triangleVertices = new Float32Array();
        this.triangleUVs = new Float32Array();
        this.triangleNormals = new Float32Array();
    }

    calculateLineVertices(){
        let lines = [];
        for(let j = 0; j < 6; j++){
            for(let i = 0; i < 44; i++){
                lines.push(this.vertexCoordinates[j * 45 + i]);
                lines.push(this.vertexCoordinates[j * 45 + i + 1]);
            }
            lines.push(this.vertexCoordinates[j * 45 + 44]);
            lines.push(this.vertexCoordinates[j * 45 + 0]);
        }

        this.lineVertices = new Float32Array(lines.flat());
        this.lineUVs = new Float32Array(
            Array(lines.length * 2).fill(1.0)
        );
        this.lineNormals = new Float32Array(
            Array(lines.length * 3).fill(1.0)
        );
    }
}