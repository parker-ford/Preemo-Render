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

struct VertexOutput {
    @builtin(position) position : vec4<f32>,
    @location(0) color : vec4<f32>,
};

@vertex
fn vertex_main(@builtin(instance_index) id: u32, @location(0) position: vec4<f32>, @location(1) color: vec4<f32>) -> VertexOutput {
    var output: VertexOutput;
    // output.position = transformUBO.projection * transformUBO.view * transformUBO.model * position;
    output.position = transformUBO.projection * transformUBO.view * objects.models[id].model * position;
    output.color = color;
    return output;
}

@fragment
fn fragment_main(fragData: VertexOutput) -> @location(0) vec4<f32>{
    return fragData.color;
}