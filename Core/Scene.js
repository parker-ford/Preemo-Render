import {PerspectiveCamera} from './PerspectiveCamera.js';
import { Light } from '../Lights/Light.js';

export class Scene {
    constructor() {
        //Objects
        this.objects = [];
        this.object_count = 0;
        this.object_data = new Float32Array();

        //Lights
        this.lights = [];
        this.lights_count = 0;
        this.light_data = new ArrayBuffer(0);

        //Debug
        this.print = false;
    }

    add(object) {
        this.objects.push(object);
        if(object.transform && !(object instanceof PerspectiveCamera)){
            this.object_count++;
            this.object_data = new Float32Array(this.object_data.length + 32);
        }
        if(object instanceof Light){
            this.lights.push(object);
            this.lights_count++;
            this.light_data = new ArrayBuffer(this.light_data.byteLength + 80);
        }
    }

    remove(object) {
        let objIndex = this.objects.indexOf(object);
        if(objIndex !== -1){
            this.objects.splice(objIndex, 1);
            this.object_count--;
            this.object_data = new Float32Array(this.object_data.length - 32);
        }
        let lightIndex = this.lights.indexOf(object);
        if(lightIndex !== -1){
            console.log("removing light");
            this.lights.splice(lightIndex, 1);
            this.lights_count--;
            this.light_data = new ArrayBuffer(this.light_data.byteLength - 80);
        }
    }

    //TODO: I bet this doesn't work but I don't think I'll care until later
    clear() {
        this.objects = [];
        this.object_count = 0;
    }

    update(){
        var transformOffset = 0;
        this.objects.forEach(element => {
            
            if(typeof element.update === 'function'){
                element.update();
            }

            if(element.transform && !(element instanceof PerspectiveCamera)){
                if(this.print){
                    console.log(element);
                    console.log(element.transform.TRS);
                    console.log(element.transform.TRS_I_T);
                    console.log("---")
                }
                for(var i = 0; i < 16; i++){
                    this.object_data[32 * transformOffset + i] = element.transform.TRS.at(i);
                }
                for(var i = 0; i < 16; i++){
                    this.object_data[32 * transformOffset + 16 + i] = element.transform.TRS_I_T.at(i);
                }
                transformOffset++;
            }
        });

        var lightOffset = 0;
        this.lights.forEach(light => {
            const LightDataValues = new ArrayBuffer(80);
            const LightDataViews = {
                color: new Float32Array(LightDataValues, 0, 4),
                position: new Float32Array(LightDataValues, 16, 3),
                direction: new Float32Array(LightDataValues, 32, 3),
                intensity: new Float32Array(LightDataValues, 44, 1),
                falloff: new Float32Array(LightDataValues, 48, 1),
                maxDistance: new Float32Array(LightDataValues, 52, 1),
                umbra: new Float32Array(LightDataValues, 56, 1),
                penumbra: new Float32Array(LightDataValues, 60, 1),
                mode: new Uint32Array(LightDataValues, 64, 1),
            };
            LightDataViews.color.set(light.color);
            LightDataViews.position.set(light.transform.position);
            LightDataViews.direction.set(light.transform.forward);
            LightDataViews.intensity[0] = light.intensity;
            LightDataViews.falloff[0] = light.fallOff;
            LightDataViews.maxDistance[0] = light.maxDistance;
            LightDataViews.umbra[0] = light.umbra;
            LightDataViews.penumbra[0] = light.penumbra;
            LightDataViews.mode[0] = light.mode;

            const lightDataView = new Uint8Array(LightDataValues);
            const allLightsView = new Uint8Array(this.light_data, lightOffset * 80, 80);
            allLightsView.set(lightDataView);


            lightOffset++;
        })
        this.print = false;
    }
}