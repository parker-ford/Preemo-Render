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
// @binding(2) @group(0) var<uniform> shadowProjection: mat4x4<f32>;
@binding(2) @group(0) var<uniform> shadowRecieverData: ShadowRecieverData;
@binding(3) @group(0) var<storage, read> lights: LightArray; 

const NUM_LIGHTS: u32 = 16;

struct VertexOutput {
    @builtin(position) position : vec4<f32>,
    @location(0) worldPos: vec3<f32>
};


// fn planar_project_directional(vec3<f32> worldPos){

// }

fn planar_project_point(worldPos: vec4<f32>) -> vec4<f32>{
    // var l: vec3<f32> = lights.lights[0].position - worldPos.xyz;
    // var n: vec3<f32> = shadowRecieverData.recieverNormal; 
    // var ndotl: f32 = dot(l, n);
    // var d: f32 = 0;
    // var projection: mat4x4<f32> = mat4x4<f32>(
    //     vec4<f32>(ndotl + d - (l.x * n.x), -(l.x * n.y), -(l.x * n.z), -(l.x * d)),
    //     vec4<f32>(-(l.y * n.x), ndotl + d - (l.y * n.y), -(l.y * n.z), -(l.y * d)),
    //     vec4<f32>(-(l.z * n.x), -(l.z * n.y), ndotl + d - (l.z * n.z), -(l.z * d)),
    //     vec4<f32>(-n.x, -n.y, -n.z, ndotl)
    // );

    // return worldPos * projection;
    var o: vec3<f32> = worldPos.xyz;
    var d: vec3<f32> = normalize(worldPos.xyz - lights.lights[0].position);
    var t: f32 = dot(shadowRecieverData.recieverNormal, (shadowRecieverData.recieverPosition - o)) / dot(shadowRecieverData.recieverNormal, d);

    return vec4<f32>(o + d * t, 1.0);
}

fn planar_project_directional(worldPos: vec4<f32>) -> vec4<f32>{
    // var l: vec3<f32> = normalize(-lights.lights[0].position);
    // var n: vec3<f32> = shadowRecieverData.recieverNormal; 
    // var ndotl: f32 = dot(l, n);
    // var d: f32 = 0;
    // var projection: mat4x4<f32> = mat4x4<f32>(
    //     vec4<f32>(ndotl + d - (l.x * n.x), -(l.x * n.y), -(l.x * n.z), -(l.x * d)),
    //     vec4<f32>(-(l.y * n.x), ndotl + d - (l.y * n.y), -(l.y * n.z), -(l.y * d)),
    //     vec4<f32>(-(l.z * n.x), -(l.z * n.y), ndotl + d - (l.z * n.z), -(l.z * d)),
    //     vec4<f32>(-n.x, -n.y, -n.z, ndotl)
    // );

    var o: vec3<f32> = worldPos.xyz;
    var d: vec3<f32> = -normalize(lights.lights[0].position);
    var t: f32 = dot(shadowRecieverData.recieverNormal, (shadowRecieverData.recieverPosition - o)) / dot(shadowRecieverData.recieverNormal, d);

    return vec4<f32>(o + d * t, 1.0);
}

@vertex
fn vertex_main(@builtin(instance_index) id: u32, 
@location(0) position: vec3<f32>) -> VertexOutput {

    var output: VertexOutput;
    var worldPos = (objects.models[id].model * vec4<f32>(position, 1.0));
    // worldPos = worldPos * shadowProjection;
    // worldPos = shadowProjection * worldPos;

    
    
    worldPos = planar_project_point(worldPos);
    // worldPos = planar_project_directional(worldPos);

    worldPos.y += 0.01;
    output.worldPos = position;
    output.position = transformUBO.projection * transformUBO.view * worldPos;
    return output;
}


@fragment
fn fragment_main(fragData: VertexOutput) -> @location(0) vec4<f32>{

    // var res: vec3<f32> = abs(fragData.worldPos);
    var res: vec3<f32> = vec3<f32>(0.0, 1.0, 0.0);
    // var res: vec3<f32> = normalize(shadowRecieverData.recieverPosition);
    return vec4<f32>(res, 1.0);
    
}