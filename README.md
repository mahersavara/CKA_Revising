# CKA Revising Repository

Welcome to the CKA Revising repository! This repository contains materials, notes, and lab environments to help you prepare for the Certified Kubernetes Administrator (CKA) exam.

## 🚀 Setting up the Vagrant Environment

We provide a fully automated, lightweight, and production-like Multi-Node Kubernetes Cluster Lab using **Vagrant** and **Hyper-V** on Windows.

### Quick Start
Navigate to the `vagrant-cka-lab` directory:
```powershell
cd vagrant-cka-lab
```

You can start the lab using the provided batch script:
```powershell
.\start-lab.bat
```
*(This will automatically download the Ubuntu image, bootstrap both nodes via kubeadm, configure networking, and SSH into the control-plane node).*

For full details, prerequisites (like enabling Hyper-V and installing Vagrant), and instructions on how to stop/reset the lab, please refer to the detailed README here:  
👉 **[`vagrant-cka-lab/README.md`](./vagrant-cka-lab/README.md)**

---

## 🛠️ CK-x-simulator

This repository also includes the setup for **CK-x-simulator**, which is great for exam simulation.

You can find the simulator files in the following directory:  
👉 **[`./ck-x-simulator`](./ck-x-simulator)**

To run the simulator, navigate to that directory and bring up the environment using Docker Compose:
```powershell
cd ck-x-simulator
docker-compose up -d
```

---

*Happy studying and good luck on your CKA Exam!*
