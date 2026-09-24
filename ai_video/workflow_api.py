import json

WIDTH, HEIGHT, FRAMES, FPS = 832, 480, 129, 16
STEPS, CFG, SEED = 20, 6.0, 0

DEFAULT_PROMPT = """An attractive fictional young adult female AI influencer walking confidently on a luxury street in Dubai at golden hour, modern skyscrapers and luxury cars in the background, cinematic camera movement, realistic skin and hair, natural walking motion, premium social-media aesthetic, shallow depth of field, cinematic lighting."""

NEGATIVE_PROMPT = """blurry, low quality, distorted face, deformed body, extra fingers, extra limbs, bad hands, bad anatomy, duplicate person, static image, frozen motion, jitter, flicker, text, subtitles, watermark, logo, oversaturated, overexposed, underexposed"""

def build_workflow(prompt: str, seed: int | None = None) -> dict:
    seed = SEED if seed is None else int(seed)
    return {
        "1":{"class_type":"UNETLoader","inputs":{"unet_name":"wan2.1_t2v_1.3B_fp16.safetensors","weight_dtype":"default"}},
        "2":{"class_type":"ModelSamplingSD3","inputs":{"model":["1",0],"shift":8.0}},
        "3":{"class_type":"CLIPLoader","inputs":{"clip_name":"umt5_xxl_fp8_e4m3fn_scaled.safetensors","type":"wan","device":"default"}},
        "4":{"class_type":"CLIPTextEncode","inputs":{"text":prompt,"clip":["3",0]}},
        "5":{"class_type":"CLIPTextEncode","inputs":{"text":NEGATIVE_PROMPT,"clip":["3",0]}},
        "6":{"class_type":"EmptyHunyuanLatentVideo","inputs":{"width":WIDTH,"height":HEIGHT,"length":FRAMES,"batch_size":1}},
        "7":{"class_type":"KSampler","inputs":{"model":["2",0],"positive":["4",0],"negative":["5",0],"latent_image":["6",0],"seed":seed,"steps":STEPS,"cfg":CFG,"sampler_name":"uni_pc","scheduler":"simple","denoise":1.0}},
        "8":{"class_type":"VAELoader","inputs":{"vae_name":"wan_2.1_vae.safetensors"}},
        "9":{"class_type":"VAEDecode","inputs":{"samples":["7",0],"vae":["8",0]}},
        "10":{"class_type":"VHS_VideoCombine","inputs":{"images":["9",0],"frame_rate":FPS,"loop_count":0,"filename_prefix":"wan21_demo","format":"video/h264-mp4","pix_fmt":"yuv420p","crf":18,"save_metadata":True,"trim_to_audio":False,"pingpong":False,"save_output":True,"videopreview":{"hidden":True,"paused":False,"params":{"hide_metadata":False,"filename":"","subfolder":"","type":"output"}}}}
    }

if __name__ == "__main__":
    print(json.dumps(build_workflow(DEFAULT_PROMPT), indent=2))
