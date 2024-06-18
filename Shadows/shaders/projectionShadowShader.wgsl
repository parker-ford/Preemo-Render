struct TransformData {
    view: mat4x4<f32>,
    projection: mat4x4<f32>
};

struct ModelData{
    model: mat4x4<f32>,
    model_i_t: mat4x4<f32>
};

struct ObjectData {
    models: array<ModelData>,
};

struct LightData {
    color: vec4<f32>,
    position: vec3<f32>,
    direction: vec3<f32>,
    intensity: f32,
    falloff: f32,
    maxDistance: f32,
    umbra: f32,
    penumbra: f32,
    mode: u32
};

struct LightArray {
    lights: array<LightData>,
};

struct ShadowRecieverData {
    recieverNormal: vec3<f32>,
    recieverPosition: vec3<f32>
};


@binding(0) @group(0) var<uniform> transformUBO: TransformData;
@binding(1) @group(0) var<storage, read> objects: ObjectData;
@binding(2) @group(0) var<uniform> shadowRecieverData: ShadowRecieverData;
@binding(3) @group(0) var<storage, read> lights: LightArray; 

const NUM_LIGHTS: u32 = 16;

struct VertexOutput {
    @builtin(position) position : vec4<f32>,
};


fn planar_project_point(worldPos: vec4<f32>) -> vec4<f32>{
    var o: vec3<f32> = worldPos.xyz;
    var d: vec3<f32> = normalize(worldPos.xyz - lights.lights[0].position);
    var t: f32 = dot(shadowRecieverData.recieverNormal, (shadowRecieverData.recieverPosition - o)) / dot(shadowRecieverData.recieverNormal, d);

    return vec4<f32>(o + d * t, 1.0);
}

fn planar_project_directional(worldPos: vec4<f32>) -> vec4<f32>{
    var o: vec3<f32> = worldPos.xyz;
    var d: vec3<f32> = -normalize(lights.lights[0].position);
    var t: f32 = dot(shadowRecieverData.recieverNormal, (shadowRecieverData.recieverPosition - o)) / dot(shadowRecieverData.recieverNormal, d);

    return vec4<f32>(o + d * t, 1.0);
}

fn planar_project(worldPos: vec4<f32>) -> vec4<f32>{

    if(lights.lights[0].mode == 0){
        return planar_project_directional(worldPos);
        
    }else{
        return planar_project_point(worldPos);
    }
}

@vertex
fn vertex_main(@builtin(instance_index) id: u32, 
@location(0) position: vec3<f32>) -> VertexOutput {

    var output: VertexOutput;
    var worldPos = (objects.models[id].model * vec4<f32>(position, 1.0));
    worldPos = planar_project(worldPos);

    //Bias shadow to prevent z-fighting
    worldPos = vec4<f32>(worldPos.xyz + (shadowRecieverData.recieverNormal * .01), 1.0);

    output.position = transformUBO.projection * transformUBO.view * worldPos;
    return output;
}


@fragment
fn fragment_main(fragData: VertexOutput) -> @location(0) vec4<f32>{
    var res: vec3<f32> = vec3<f32>(0.2, 0.2, 0.2);
    return vec4<f32>(res, 1.0);    
}