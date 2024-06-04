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

@binding(0) @group(0) var<uniform> transformUBO: TransformData;
@binding(1) @group(0) var<storage, read> objects: ObjectData;
@binding(2) @group(0) var<uniform> color: vec4<f32>;

struct VertexOutput {
    @builtin(position) position : vec4<f32>,
    @location(0) normal : vec3<f32>,
};

@vertex
fn vertex_main(@builtin(instance_index) id: u32, 
@location(0) position: vec3<f32>,
@location(2) normal: vec3<f32> ) -> VertexOutput {
    var output: VertexOutput;
    output.position = transformUBO.projection * transformUBO.view * objects.models[id].model * vec4<f32>(position, 1.0);
    output.normal = (objects.models[id].model_i_t * vec4(normal,0)).xyz;
    output.normal = normalize(output.normal);
    return output;
}

@fragment
fn fragment_main(fragData: VertexOutput) -> @location(0) vec4<f32>{
    var coolColor: vec4<f32> = 0.25 * color + vec4<f32>(0.0, 0.0, 0.55, 0.0);
    var warmColor: vec4<f32> = 0.25 * color + vec4<f32>(0.3, 0.3, 0.0, 0.0);
    var t: f32 = dot(fragData.normal, normalize(vec3<f32>(-1.0, 2.0, 0.0)));
    t += 1;
    t *= 0.5;


    return t*warmColor + (1-t)*coolColor;
}