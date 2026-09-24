import json, os, time
from pathlib import Path
import requests
import ipywidgets as widgets
from IPython.display import display, clear_output
from workflow_api import DEFAULT_PROMPT, build_workflow

COMFY_URL = os.environ.get("COMFY_URL", "http://127.0.0.1:8188")
ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "output"
OUTPUT.mkdir(parents=True, exist_ok=True)

prompt_box = widgets.Textarea(value=DEFAULT_PROMPT, description="Prompt:", layout=widgets.Layout(width="100%", height="180px"))
seed_box = widgets.IntText(value=0, description="Seed:")
generate_btn = widgets.Button(description="Generate Video", button_style="success")
status = widgets.Output()

def wait_for_result(prompt_id, timeout=3600):
    started = time.time()
    while time.time() - started < timeout:
        item = requests.get(f"{COMFY_URL}/history/{prompt_id}", timeout=30).json().get(prompt_id)
        if item:
            if item.get("status", {}).get("status_str") == "error":
                raise RuntimeError(json.dumps(item.get("status", {}), indent=2))
            if item.get("outputs"):
                return item
        time.sleep(2)
    raise TimeoutError("ComfyUI generation timed out.")

def on_generate(_):
    with status:
        clear_output()
        print("Submitting to ComfyUI...")
        r = requests.post(f"{COMFY_URL}/prompt", json={"prompt": build_workflow(prompt_box.value.strip(), seed_box.value)}, timeout=60)
        r.raise_for_status()
        prompt_id = r.json()["prompt_id"]
        print("Generation started:", prompt_id)
        result = wait_for_result(prompt_id)
        files = []
        for node_output in result.get("outputs", {}).values():
            files += node_output.get("gifs", []) + node_output.get("videos", [])
        if not files:
            print("Generation finished, but no video file was reported.")
            return
        video = files[0]
        params = {"filename":video["filename"], "subfolder":video.get("subfolder",""), "type":video.get("type","output")}
        data = requests.get(f"{COMFY_URL}/view", params=params, timeout=120).content
        final_path = OUTPUT / video["filename"]
        final_path.parent.mkdir(parents=True, exist_ok=True)
        raw_path = OUTPUT / ("raw_" + video["filename"])
        raw_path.parent.mkdir(parents=True, exist_ok=True)
        raw_path.write_bytes(data)
        final_path = OUTPUT / video["filename"]
        import subprocess
        subprocess.run([
            "ffmpeg", "-y", "-i", str(raw_path), "-t", "8.0",
            "-c:v", "libx264", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
            str(final_path)
        ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        raw_path.unlink(missing_ok=True)
        print("Done:", final_path)

generate_btn.on_click(on_generate)
display(prompt_box, seed_box, generate_btn, status)
