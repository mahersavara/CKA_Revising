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

## 🛠️ CKA-PREP-2025-v2

This repository also includes a set of straightforward CKA practice labs, each in its own folder with setup scripts, questions, and solution notes.

You can find the practice questions in the following directory:  
👉 **[`./CKA-PREP-2025-v2`](./CKA-PREP-2025-v2)**

To use the practice labs, follow the detailed instructions here:
👉 **[`CKA-PREP-2025-v2/README.md`](./CKA-PREP-2025-v2/README.md)**

---

*Happy studying and good luck on your CKA Exam!*
