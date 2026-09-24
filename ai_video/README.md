# Wan 2.1 T2V demo

## Run

1. Open `ai_video/wan21_t2v_colab.ipynb` in Google Colab.
2. Select a GPU runtime.
3. Run the cells top-to-bottom.
4. In the final cell, enter a prompt and press **Generate Video**.

The notebook installs ComfyUI, downloads Wan 2.1 T2V 1.3B and its required text encoder/VAE, starts ComfyUI, and provides the prompt interface.

Output: `ai_video/output/*.mp4`.

Configuration: 832x480, 16 fps, 129 frames (~8.06 s), 20 steps, CFG 6.
