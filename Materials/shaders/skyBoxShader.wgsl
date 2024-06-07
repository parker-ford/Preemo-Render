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
@binding(2) @group(0) var ourSampler: sampler;
@binding(3) @group(0) var ourTexture: texture_cube<f32>;

struct VertexOutput {
    @builtin(position) position : vec4<f32>,
    @location(0) direction: vec3<f32>
};


@vertex
fn vertex_main(@builtin(instance_index) id: u32, @location(0) position: vec3<f32>) -> VertexOutput {
    var output: VertexOutput;
    var view_no_translation: mat4x4<f32> = transformUBO.view;
    view_no_translation[3] = vec4<f32>(0.0, 0.0, 0.0, 1.0);
    output.position = transformUBO.projection * view_no_translation * vec4<f32>(position, 1.0);
    output.direction = normalize(position.xyz);
    return output;
}

@fragment
fn fragment_main(fragData: VertexOutput) -> @location(0) vec4<f32>{
    return textureSample(ourTexture, ourSampler, -fragData.direction);
}