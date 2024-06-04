import { Renderer } from "./Renderer";

export class Texture {

    static classMipModule = null;
    static classMipSampler = null;
    static pipelinesByFormat = {};
    static defaultTexture = null;

    static getDefaultTexture() {
        if(!this.defaultTexture){
            this.defaultTexture = new Texture({});
        }
        return this.defaultTexture;
    }

    constructor(options) {
        this.path = options.path;
        this.format = options.format || 'rgba8unorm';
        this.addressMode = options.addressMode || 'repeat';
        this.filter = options.filter || 'linear';
        this.mipmap = options.mipmap || 'nearest';
        this.anisotropy = options.anisotropy | 1;
        this.useMips = options.useMips || false;
        this.source = null;
        this.width = 0;
        this.height = 0;
        this.textureInstance = null;
        this.sampler = null;
        this.mipSampler = this.getMipSampler();
        this.mipModule = this.getMipModule();
        this.pipeline = this.getPipelineByFormat(this.format);

        this.loadedPromise = this.init();

    }

    loaded() {
        return this.loadedPromise;
    }

    async init() {
        await this.loadImageBitmap();
        this.createTextureInstance();
        if(this.path){
            this.copySourceToTexture();
        }
        else{
            this.writeTextureData();
        }
    }

    async loadImageBitmap() {
        if(this.path){
            const response = await fetch(this.path);
            const blob = await response.blob();
            this.source = await createImageBitmap(blob);
            this.width = this.source.width;
            this.height = this.source.height;
        }
        else{
            const size = 64;
            this.source = new Uint8Array(size * size * 4);
            this.source.fill(255); 
            this.width = 64;
            this.height = 64;
        }
    }

    createTextureInstance() {

        //Texture
        const textureDescriptor = {
            label: this.path || 'default texture',
            size: {
                width: this.width,
                height: this.height,
            },
            format: this.format,
            mipLevelCount: this.useMips ? this.numMipLevels(this.width, this.height) : 1,
            usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT,
        };

        this.textureInstance = Renderer.instance.getDevice().createTexture(textureDescriptor);

        //Texture view
        const viewDescriptor = {
            format: this.format,
            dimension: '2d',
            aspect: 'all',
            baseMipLevel: 0,
            mipLevelCount: this.useMips ? this.numMipLevels(this.width, this.height) : 1,
            baseArrayLayer: 0,
            arrayLayerCount: 1,
        }

        this.textureView = this.textureInstance.createView(viewDescriptor);

        //Sampler
        const samplerDescriptor = {
            addressModeU: this.addressMode,
            addressModeV: this.addressMode,
            magFilter: this.filter,
            minFilter: this.filter,
            mipmapFilter: this.mipmap,
            maxAnisotropy: this.anisotropy,
        }

        this.sampler = Renderer.instance.getDevice().createSampler(samplerDescriptor);
    }

    copySourceToTexture() {
        Renderer.instance.getDevice().queue.copyExternalImageToTexture(
            { source: this.source, flipY: true},
            { texture: this.textureInstance },
            {width: this.width, height: this.height}
        );
        if(this.useMips){
            this.generateMips();
        }
    }

    writeTextureData() {
        Renderer.instance.getDevice().queue.writeTexture(
            { texture: this.textureInstance },
            this.source,
            { bytesPerRow: this.width * 4 },
            { width: this.width, height: this.width },
        );
    }


    getMipModule() {
        if(!this.constructor.classModule){
            this.constructor.classModule = Renderer.instance.getDevice().createShaderModule({
                label: 'mip level generator module',
                code: `
                  struct VertexOutput {
                    @builtin(position) position: vec4<f32>,
                    @location(0) uv : vec2<f32>,
                  };
           
                  @vertex
                  fn vertex_main( @builtin(vertex_index) vertexIndex : u32
                  ) -> VertexOutput {
                    let pos = array(
                      vec2<f32>( 0.0,  0.0),  // center
                      vec2<f32>( 1.0,  0.0),  // right, center
                      vec2<f32>( 0.0,  1.0),  // center, top
                      vec2<f32>( 0.0,  1.0),  // center, top
                      vec2<f32>( 1.0,  0.0),  // right, center
                      vec2<f32>( 1.0,  1.0),  // right, top
                    );
           
                    var output: VertexOutput;
                    let xy = pos[vertexIndex];
                    output.position = vec4<f32>(xy * 2.0 - 1.0, 0.0, 1.0);
                    output.uv = vec2<f32>(xy.x, 1.0 - xy.y);
                    return output;
                  }
           
                  
                  @binding(0) @group(0) var ourSampler: sampler;
                  @binding(1) @group(0) var ourTexture: texture_2d<f32>;
           
                  @fragment
                  fn fragment_main(fragData: VertexOutput) -> @location(0) vec4<f32> {
                    return textureSample(ourTexture, ourSampler, fragData.uv);
                  }
                `,
            });
        }
        return this.constructor.classModule;
    }

    getMipSampler() {
        if(!this.constructor.classSampler){
            this.constructor.classSampler = Renderer.instance.getDevice().createSampler({
                minFilter: 'linear',
            });
        }
        return this.constructor.classSampler;
    }

    getPipelineByFormat(format) {
        if(!this.constructor.pipelinesByFormat[format]){
            this.constructor.pipelinesByFormat[format] = Renderer.instance.getDevice().createRenderPipeline({
                label: 'mip level generator pipeline',
                layout: 'auto',
                vertex: {
                    module: this.getMipModule(),
                    entryPoint: 'vertex_main',
                },
                fragment: {
                    module: this.getMipModule(),
                    entryPoint: 'fragment_main',
                    targets: [{ format: format }],
                },
            });
        }
        return this.constructor.pipelinesByFormat[format];
    }



    generateMips() {
        const encoder = Renderer.instance.getDevice().createCommandEncoder({
            label: 'mip gen encoder',
        });

        let baseMipLevel = 0;
        let width = this.width;
        let height = this.height;
        while(width > 1 || height > 1){
            width = Math.max(1, width / 2 | 0);
            height = Math.max(1, height / 2 | 0);
            const bindGroup = Renderer.instance.getDevice().createBindGroup({
                layout: this.pipeline.getBindGroupLayout(0),
                entries: [
                    { binding: 0, resource: this.mipSampler },
                    { binding: 1, resource: this.textureInstance.createView({baseMipLevel, mipLevelCount: 1}) },
                ],
            });

            baseMipLevel++;

            const renderPassDescriptor = {
                label: 'basic canvas renderPass',
                colorAttachments: [
                    {
                        view: this.textureInstance.createView({baseMipLevel, mipLevelCount: 1}),
                        loadOp: 'clear',
                        storeOp: 'store',
                    }
                ]
            }

            const pass = encoder.beginRenderPass(renderPassDescriptor);
            pass.setPipeline(this.pipeline);
            pass.setBindGroup(0, bindGroup);
            pass.draw(6);
            pass.end();
        }

        const commandBuffer = encoder.finish();
        Renderer.instance.getDevice().queue.submit([commandBuffer]);
    }

    numMipLevels = (...sizes) => {
        const maxSize = Math.max(...sizes);
        return 1 + Math.log2(maxSize) | 0;
    };
}