# 🦷 ToothAid – AI & IoT-Based Dental Diagnostic System

## 📌 Overview

ToothAid is an AI + IoT-based system designed for early detection of dental conditions such as cavities and plaque using intraoral images.  
The system performs optimized on-device inference using Raspberry Pi and provides predictions through a web-based interface for visualization and patient history tracking.

The goal of this project is to build a portable, low-cost diagnostic support system for remote or resource-constrained environments.

---

## ❗ Problem Statement

Early-stage dental problems often go undetected due to:

- Limited access to diagnostic tools
- Dependence on manual visual inspection
- Lack of affordable screening systems in rural areas

ToothAid aims to provide:

- Automated image-based dental screening
- On-device AI inference (low latency)
- Secure patient record management
- Remote visualization of diagnostic results

---

## 🏗 System Architecture

### 🔹 Hardware Layer
- Raspberry Pi
- Camera module for intraoral image capture

### 🔹 AI Layer
- YOLOv5 for object detection
- CNN model for classification
- TensorFlow Lite for optimized inference
- OpenCV for image preprocessing

### 🔹 Backend
- Node.js
- Express.js
- REST APIs for authentication and prediction
- Database integration for storing reports

### 🔹 Frontend
- MERN-based web interface
- Image upload functionality
- Diagnosis visualization dashboard
- Patient history tracking

---

## 🚀 Key Features

- On-device inference using TensorFlow Lite
- Detection of cavities and plaque using YOLOv5
- Classification using custom CNN model
- Secure authentication system
- REST API-based prediction pipeline
- Patient history management
- Modular and scalable backend design

---

## 🤖 AI Model Details

### Detection Model
- YOLOv5 trained on labeled intraoral images
- Identifies suspected regions of dental issues

### Classification Model
- Custom CNN architecture
- Classifies severity of detected issues

### Optimization
- Converted model to TensorFlow Lite
- Applied quantization for faster inference
- Optimized for Raspberry Pi memory and CPU constraints

---

## 🧰 Tech Stack

### AI & ML
- YOLOv5
- TensorFlow / TensorFlow Lite
- OpenCV

### Backend
- Node.js
- Express.js
- MongoDB (or your database)

### Frontend
- React.js

### IoT
- Raspberry Pi



## 🔐 API Endpoints

### Authentication
- POST `/api/auth/register`
- POST `/api/auth/login`

### Prediction
- POST `/api/predict`
  - Upload image
  - Returns detection + classification results

### Patient History
- GET `/api/patient/:id`
  - Fetch previous diagnosis reports

---


### 3️⃣ AI Model (Raspberry Pi)
- Install required Python dependencies
- Place `.tflite` model in the `ai/` directory
- Run inference script

---

## 🧠 Challenges Faced

- Optimizing YOLOv5 for Raspberry Pi constraints
- Reducing inference latency
- Managing consistent image preprocessing
- Designing modular APIs for scalability

---

## 🔮 Future Improvements

- Expanded dataset for improved accuracy
- Edge-to-cloud synchronization
- Multi-class dental condition support

---

## 👨‍💻 Author

**Nikhil N Nair**  
GitHub: https://github.com/nikhiln0702
