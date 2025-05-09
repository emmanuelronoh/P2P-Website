# 🌐 P2P Connect - Secure Peer-to-Peer Platform

![GitHub last commit](https://img.shields.io/github/last-commit/clientname/P2P-Website?style=flat-square&color=blue)
![GitHub repo size](https://img.shields.io/github/repo-size/clientname/P2P-Website?style=flat-square)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=flat-square&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat-square&logo=react&logoColor=%2361DAFB)
![Django](https://img.shields.io/badge/django-%23092E20.svg?style=flat-square&logo=django&logoColor=white)

A production-grade peer-to-peer communication platform with modern frontend (Vite + React) and robust backend (Django). Enables secure, real-time interactions between users with complete data ownership.

##  Live Deployment

[![Production URL](https://img.shields.io/badge/production-live-brightgreen)](https://client-p2p-platform.com)  
[![Staging URL](https://img.shields.io/badge/staging-testing-yellow)](https://staging.client-p2p-platform.com)

## ✨ Core Features

- **Zero Trust Architecture**: End-to-end encrypted communications
- **Real-Time Connectivity**: WebRTC for browser-to-browser connections
- **Hybrid P2P Model**: Django coordination server with client-direct connections
- **Modern UI**: Responsive design with dark/light mode support
- **Session Management**: JWT authentication with refresh tokens
- **Media Streaming**: Optimized for video/audio/data transfer

##  System Architecture

```mermaid
graph TD
    A[Client Vite/React] -->|WebRTC| B(Peer Client)
    A -->|REST API| C[Django Backend]
    C --> D[(PostgreSQL)]
    A -->|WebSockets| C
    B -->|STUN/TURN| E[ICE Servers]
```


##  Technology Stack

### Frontend (Vite + React)

- **Vite 4** – Next-gen frontend tooling for faster builds
- **React 18** – With hooks and context API
- **Default CSS** – No utility frameworks, just clean and simple styling
- **WebRTC** – Real-time peer connections and data channels
- **Axios** – For HTTP API requests
- **Zustand** – Lightweight state management library

## 📦 Installation & Setup


### Frontend Setup

```bash
git clone https://github.com/emmanuelronoh/P2P-Website.git
cd P2P-Website
npm install
npm run dev 