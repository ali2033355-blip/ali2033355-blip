import os, subprocess, sys, time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
COMFY = ROOT / "ComfyUI"
HF = "https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged/resolve/main"

def sh(cmd):
    print("+", " ".join(cmd))
    subprocess.run(cmd, check=True)

def download(url, target):
    target.parent.mkdir(parents=True, exist_ok=True)
    if not target.exists():
        sh(["wget","-q","--show-progress",url,"-O",str(target)])

def install():
    if not COMFY.exists():
        sh(["git","clone","--depth","1","https://github.com/comfyanonymous/ComfyUI.git",str(COMFY)])
    sh([sys.executable,"-m","pip","install","-r",str(COMFY/"requirements.txt")])
    sh([sys.executable,"-m","pip","install","-r",str(ROOT/"requirements.txt")])

    custom = COMFY/"custom_nodes"/"ComfyUI-VideoHelperSuite"
    if not custom.exists():
        sh(["git","clone","--depth","1","https://github.com/Kosinkadink/ComfyUI-VideoHelperSuite.git",str(custom)])
    req = custom/"requirements.txt"
    if req.exists():
        sh([sys.executable,"-m","pip","install","-r",str(req)])

    download(f"{HF}/split_files/diffusion_models/wan2.1_t2v_1.3B_fp16.safetensors", COMFY/"models/diffusion_models/wan2.1_t2v_1.3B_fp16.safetensors")
    download(f"{HF}/split_files/text_encoders/umt5_xxl_fp8_e4m3fn_scaled.safetensors", COMFY/"models/text_encoders/umt5_xxl_fp8_e4m3fn_scaled.safetensors")
    download(f"{HF}/split_files/vae/wan_2.1_vae.safetensors", COMFY/"models/vae/wan_2.1_vae.safetensors")

def start():
    import requests
    log = open(ROOT/"comfyui.log","w")
    env = os.environ.copy()
    env["PYTHONUNBUFFERED"]="1"
    cmd=[sys.executable,str(COMFY/"main.py"),"--listen","127.0.0.1","--port","8188","--lowvram","--cpu-vae"]
    subprocess.Popen(cmd,cwd=COMFY,env=env,stdout=log,stderr=subprocess.STDOUT)
    for _ in range(180):
        try:
            requests.get("http://127.0.0.1:8188/system_stats",timeout=2)
            print("ComfyUI is ready.")
            return
        except Exception:
            time.sleep(2)
    raise RuntimeError("ComfyUI did not start. Check ai_video/comfyui.log")

if __name__=="__main__":
    install()
    start()
