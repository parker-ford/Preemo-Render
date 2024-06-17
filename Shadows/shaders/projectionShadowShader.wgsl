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


@binding(0) @group(0) var<uniform> transformUBO: TransformData;
@binding(1) @group(0) var<storage, read> objects: ObjectData;
@binding(2) @group(0) var<uniform> shadowProjection: mat4x4<f32>;
@binding(3) @group(0) var<storage, read> lights: LightArray; 

const NUM_LIGHTS: u32 = 16;

struct VertexOutput {
    @builtin(position) position : vec4<f32>,
    @location(0) worldPos: vec3<f32>
};

@vertex
fn vertex_main(@builtin(instance_index) id: u32, 
@location(0) position: vec3<f32>) -> VertexOutput {

    var modifiedMatrix: mat4x4<f32> = mat4x4<f32>(
        1.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    );

    var output: VertexOutput;
    // var worldPos = ( vec4<f32>(position, 1.0) * shadowProjection);
    var worldPos = (objects.models[id].model * vec4<f32>(position, 1.0));
    worldPos = worldPos * shadowProjection;
    worldPos.y += 0.001;
    output.worldPos = position;
    output.position = transformUBO.projection * transformUBO.view * worldPos;
    return output;
}


@fragment
fn fragment_main(fragData: VertexOutput) -> @location(0) vec4<f32>{

    // var res: vec3<f32> = abs(fragData.worldPos);
    var res: vec3<f32> = vec3<f32>(0.0, 0.0, 0.0);
    return vec4<f32>(res, 1.0);
    
}