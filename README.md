# 3D Gaussian Splatting Viewer

[![Open in Kaggle](https://kaggle.com/static/images/open-in-kaggle.svg)](https://kaggle.com/kernels/welcome?src=https://raw.githubusercontent.com/Vasco888888/3dgs-viewer/master/notebooks/training.ipynb) 
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Three.js](https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js&logoColor=white)
![Nerfstudio](https://img.shields.io/badge/Nerfstudio-Model-orange?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-blue)

A photorealistic 3D scene viewer built with **React Three Fiber**, powered by a Gaussian Splat model trained on custom video footage using **Nerfstudio**.

## Demo
![Demo GIF](./assets/demo.gif)

## Overview
This project demonstrates an end-to-end pipeline for **Neural Rendering**:

1.  **Input:** Captured an 11 second video of a pen on a surface.
2.  **Preprocessing:** Used **COLMAP** (Structure-from-Motion) to calculate camera poses.
3.  **Training:** Trained a Gaussian Splatting model (`splatfacto`) on NVIDIA T4 GPUs via **Kaggle**.
4.  **Deployment:** Rendered the final `.splat` file in the browser using React Three Fiber.


## Project Report
For a detailed technical analysis, including the mathematical background of Gaussian Splatting, training metrics, and a deeper discussion of the artifacts, please refer to the full report:

**[Project Report (PDF)](./docs/3dgsreport.pdf)**



## Tech Stack

### **Core Pipeline (AI and Data)**
* **Nerfstudio:** The primary framework used to train the Gaussian Splatting (`splatfacto`) model.
* **COLMAP:** Structure-from-Motion (SfM) software used to calculate 3D camera poses and sparse geometry from the 2D video frames.
* **PyTorch and CUDA:** The deep learning backbone, running on Kaggle's NVIDIA T4 GPUs to execute gradient descent, iteratively optimizing the Gaussian parameters (position, rotation, color) to minimize the error between the rendered 3D view and the original video.

### **Frontend (Viewer)**
* **React.js:** Built the interactive web interface.
* **React Three Fiber (R3F):** A React renderer for Three.js, allowing the 3D scene to be rendered declaratively in the browser.
* **@react-three/drei:** Provided high-level abstractions for the `<Splat />` loader and `<OrbitControls />` camera interaction.

### **Tools and Utilities**
* **FFmpeg:** The engine behind the scenes—used to extract individual frames from the input video for training.
* **Python (Custom Scripts):** Used to bridge the compatibility gap by converting the raw `.ply` point cloud exported from Nerfstudio into the web-optimized `.splat` binary format required for the React viewer.

---

## How to Run the Viewer
This project uses React to render the 3D scene.

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Vasco888888/3dgs-viewer.git
    cd 3dgs-viewer
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run the local server**
    ```bash
    npm start
    ```
    Open `http://localhost:3000` to see the room. 

---

## Model Training
The 3D model was trained using **Nerfstudio** on a Linux environment. Due to high VRAM requirements, training was performed on Kaggle (Tesla T4 x2).

### **The Pipeline**
You can view the full training code in the `notebooks/` folder: [`training.ipynb`](./notebooks/training.ipynb).

1.  **Data Processing (Structure-from-Motion):**
    We use COLMAP to extract camera poses from the raw video. The command runs "headless" (without a monitor) using `xvfb` to function on cloud servers.
    ```bash
    xvfb-run -a ns-process-data video \
      --data input_video.mp4 \
      --output-dir processed_data \
      --gpu  # Accelerates feature extraction on NVIDIA T4
    ```

2.  **Training (Gaussian Splatting):**
    Training runs for 15,000 iterations using the **Splatfacto** model. We use specific flags to keep the file size low for web delivery.
    ```bash
    ns-train splatfacto --data processed_data \
      --max-num-iterations 15000 \
      --pipeline.model.cull_alpha_thresh 0.01 \  # Removes transparent "haze" to save bytes
      --pipeline.model.stop_split_at 10000 \       # Stops adding points early to prevent bloat
      --viewer.quit-on-train-completion True
    ```

3.  **Export and Conversion:**
    The model is first exported to a standard point cloud (`.ply`) and then converted to the optimized binary `.splat` format for real-time WebGL rendering in our React application.
    ```bash
    # 1. Export from Nerfstudio
    ns-export gaussian-splat --load-config config.yml --output-dir exports/splat
    
    # 2. Convert to WebGL-ready format
    python convert.py exports/splat/splat.ply scene.splat
    ```

---

## Challenges and Limitations
* **Floaters (Artifacts):** The raw model exhibits high-frequency artifacts ("floaters"). This is due to a combination of factors in the input video:
    1.  **Low-Texture Surface:** The uniform grey carpet lacks distinct feature points for COLMAP to track.
    2.  **Motion Blur:** Handheld camera jitter introduced blur, further reducing feature tracking accuracy.
    3.  **Lighting Inconsistency:** Dynamic shadows violated the static scene assumption, causing the model to generate phantom geometry to account for changing pixel intensities.
* **File Format Compatibility:** React viewers (`@react-three/drei`) typically require compressed `.splat` files, whereas Nerfstudio exports `.ply`. A custom conversion step was implemented to bridge this gap.
* **Generalizability:** The model is scene-specific. New videos require a full re-training cycle.

## Project Structure
```bash
├── assets/                 # Input video and demo for README
├── docs/
│   └── 3dgsreport.pdf          # Technical report and analysis
├── logs/
│   └── traininglog.txt         # Nerfstudio training output log (15k iterations, profiling stats)
├── notebooks/
│   └── training.ipynb      # The Python notebook used on Kaggle
├── public/
│   ├── config.yml          # Nerfstudio training config (hyperparameters, optimizer settings, SH degree)
│   ├── scene.splat         # The final, cleaned 3D model
│   └── index.html          # HTML entry point
├── src/
│   ├── components/
│   │   └── Viewer.js       # The R3F Canvas component
│   ├── App.js              # Main entry point
│   └── index.js            # React root
├── LICENSE                 # Project license
└── README.md
