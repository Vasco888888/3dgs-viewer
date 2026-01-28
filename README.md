# 3D Gaussian Splatting Viewer

[![Open in Kaggle](https://kaggle.com/static/images/open-in-kaggle.svg)](https://kaggle.com/kernels/welcome?src=https://raw.githubusercontent.com/Vasco888888/3dgs-viewer/main/training/training.ipynb) 
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Three.js](https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js&logoColor=white)
![Nerfstudio](https://img.shields.io/badge/Nerfstudio-Model-orange?style=for-the-badge)

A photorealistic 3D scene viewer built with **React Three Fiber**, powered by a Gaussian Splat model trained on custom video footage using **Nerfstudio**.

## Demo
![Demo GIF](./assets/demo.gif)

## Overview
This project demonstrates an end-to-end pipeline for **Neural Rendering**:

1.  **Input:** Captured an 11 second video of a room.
2.  **Processing:** Used **COLMAP** (Structure-from-Motion) to calculate camera poses.
3.  **Training:** Trained a Gaussian Splatting model (`splatfacto`) on NVIDIA T4 GPUs via **Kaggle**.
4.  **Deployment:** Rendered the final `.splat` file in the browser using React Three Fiber.

##  Tech Stack

### **Core Pipeline (AI & Data)**
* **Nerfstudio:** The primary framework used to train the Gaussian Splatting (`splatfacto`) model.
* **COLMAP:** Structure-from-Motion (SfM) software used to calculate 3D camera poses and sparse geometry from the 2D video frames.
* **PyTorch & CUDA:** The deep learning backbone, running on Kaggle's NVIDIA T4 GPUs to execute gradient descent, iteratively optimizing the Gaussian parameters (position, rotation, color) to minimize the error between the rendered 3D view and the original video.

### **Frontend (Viewer)**
* **React.js & Vite:** Built the interactive web interface.
* **React Three Fiber (R3F):** A React renderer for Three.js, allowing the 3D scene to be rendered declaratively in the browser.
* **@react-three/drei:** Provided high-level abstractions for the `<Splat />` loader and `<OrbitControls />` camera interaction.

### **Tools & Utilities**
* **FFmpeg:** The engine behind the scenes—used to extract individual frames from the input video for training.
* **Python (Custom Scripts):** Used to bridge the compatibility gap by converting the raw `.ply` point cloud exported from Nerfstudio into the web-optimized `.splat` binary format required for the React viewer.

---

## How to Run the Viewer
This project uses Vite + React to render the 3D scene.

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

1.  **Data Processing:**
    ```bash
    ns-process-data video --data input_video.mp4 --output-dir processed_data
    ```
2.  **Training:**
    ```bash
    ns-train splatfacto --data processed_data --max-num-iterations 15000
    ```
3.  **Export & Conversion:**
    The raw output is a `.ply` file. A custom Python script was used to convert it to the binary `.splat` format required for WebGL streaming.

---

## Challenges & Limitations
* **Floaters (Artifacts):** The raw model exhibits high-frequency artifacts ("floaters"). This is due to a combination of factors in the input video:
    1.  **Low-Texture Surface:** The uniform grey carpet lacks distinct feature points for COLMAP to track.
    2.  **Motion Blur:** Handheld camera jitter introduced blur, further reducing feature tracking accuracy.
    3.  **Lighting Inconsistency:** Dynamic shadows violated the static scene assumption, causing the model to generate phantom geometry to account for changing pixel intensities.
* **File Format Compatibility:** React viewers (`@react-three/drei`) typically require compressed `.splat` files, whereas Nerfstudio exports `.ply`. A custom conversion step was implemented to bridge this gap.
* **Generalizability:** The model is scene-specific. New videos require a full re-training cycle (approx. 1.5 hours).

## Project Structure
```bash
├── assets/                 # Input video, demo for README and report
├── notebooks/
│   └── training.ipynb      # The Python notebook used on Kaggle
├── public/
│   ├── scene.splat         # The final, cleaned 3D model
│   └── index.html          # HTML entry point
├── src/
│   ├── components/
│   │   └── Viewer.js       # The R3F Canvas component
│   ├── App.js              # Main entry point
│   └── index.js            # React root
└── README.md