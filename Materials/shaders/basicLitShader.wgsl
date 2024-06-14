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
@binding(2) @group(0) var<uniform> color: vec4<f32>;
@binding(3) @group(0) var<storage, read> lights: LightArray; 


const NUM_LIGHTS: u32 = 16;

struct VertexOutput {
    @builtin(position) position : vec4<f32>,
    @location(0) normal : vec3<f32>,
    @location(1) world_position : vec3<f32>
};

@vertex
fn vertex_main(@builtin(instance_index) id: u32, 
@location(0) position: vec3<f32>,
@location(2) normal: vec3<f32> ) -> VertexOutput {
    var output: VertexOutput;
    var worldPos = (objects.models[id].model * vec4<f32>(position, 1.0));
    output.world_position = worldPos.xyz;
    output.position = transformUBO.projection * transformUBO.view * worldPos;
    output.normal = (objects.models[id].model_i_t * vec4(normal,0)).xyz;
    output.normal = normalize(output.normal);
    return output;
}

fn calculate_directional_light(normal: vec3<f32>, light: LightData) -> vec3<f32>{
    var res: vec3<f32> = vec3<f32>(0.0, 0.0, 0.0);
    var lightCol: vec4<f32> = light.color;
    var lightDir: vec3<f32> = normalize(-light.position);
    var attenuation: f32 = max(dot(-lightDir, normal), 0.0);
    res += lightCol.xyz * attenuation * light.intensity;
    return res;
}

fn calculate_point_light(normal: vec3<f32>, world_position: vec3<f32>, light: LightData) -> vec3<f32>{

    var res: vec3<f32> = vec3<f32>(0.0, 0.0, 0.0);
    var color: vec3<f32> = light.color.rgb;

    //Normalizing light ray
    var lightToPos: vec3<f32> = world_position - light.position;
    var distToPos: f32 = length(lightToPos);
    lightToPos = lightToPos / distToPos;

   //Distance attenuation
    color *=  mix(light.color.rgb * (1.0 / (distToPos * distToPos + light.falloff)), vec3<f32>(1.0, 1.0, 1.0), 1.0 - light.falloff);

    //Windowing function
    var win: f32 = 1.0 - pow((distToPos / light.maxDistance), 4.0);
    win = max(win, 0.0);
    win = win * win;
    color *= mix(win, 1.0, 1.0 - light.falloff);

    //Diffuse
    var diffuse: f32 = max(dot(-lightToPos, normal), 0.0);

    res += color * diffuse * light.intensity;

    return res;
}

fn calculate_spot_light(normal: vec3<f32>, world_position: vec3<f32>, light: LightData) -> vec3<f32>{

    var res: vec3<f32> = vec3<f32>(0.0, 0.0, 0.0);
    var color: vec3<f32> = light.color.rgb;

    //Normalizing light ray
    var lightToPos: vec3<f32> = world_position - light.position;
    var distToPos: f32 = length(lightToPos);
    lightToPos = lightToPos / distToPos;

    //Distance attenuation
    color *=  mix(light.color.rgb * (1.0 / (distToPos * distToPos + light.falloff)), vec3<f32>(1.0, 1.0, 1.0), 1.0 - light.falloff);

    //Windowing function
    var win: f32 = 1.0 - pow((distToPos / light.maxDistance), 4.0);
    win = max(win, 0.0);
    win = win * win;
    color *= mix(win, 1.0, 1.0 - light.falloff);

    //Spotlight effect
    var spotAngle: f32 = dot(normalize(lightToPos), normalize(light.direction.xyz));
    var umbraAngle: f32 = cos(light.umbra);
    var penumbraAngle: f32 = cos(mix(0.0, light.umbra, light.penumbra));
    var spot: f32 =  max(((spotAngle - umbraAngle) / (penumbraAngle - umbraAngle)), 0.0);
    spot = spot * spot;
    spot = min(spot, 1.0);

    //Diffuse
    var diffuse: f32 = max(dot(-lightToPos, normal), 0.0);

    //Final result
    res = color * spot * diffuse * light.intensity;

    return res;
}

fn calculate_light(normal: vec3<f32>, world_position: vec3<f32>) -> vec3<f32>{
    var res: vec3<f32> = vec3<f32>(0.0, 0.0, 0.0);
    for(var i: u32 = 0u; i < NUM_LIGHTS; i = i + 1u){
        if(lights.lights[i].intensity == 0.0) {continue;}
        if(lights.lights[i].mode == 0u){
            res += calculate_directional_light(normal, lights.lights[i]);
        }
        else if(lights.lights[i].mode == 1u){
            res += calculate_point_light(normal, world_position, lights.lights[i]);
        }
        else if(lights.lights[i].mode == 2u){
            res += calculate_spot_light(normal, world_position, lights.lights[i]);
        }
    }
    return res;
}

@fragment
fn fragment_main(fragData: VertexOutput) -> @location(0) vec4<f32>{

    var res: vec3<f32> = color.xyz * 0.03;
    res += calculate_light(fragData.normal, fragData.world_position) * color.xyz;
    return vec4<f32>(res, 1.0);
    
}