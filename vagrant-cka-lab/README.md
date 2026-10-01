# 🚀 CKA Kubernetes Lab on Windows (Hyper-V & Vagrant)

An automated, lightweight, and production-like Multi-Node **Kubernetes Cluster Lab** designed for **Certified Kubernetes Administrator (CKA)** exam preparation.

Runs natively on **Windows Hyper-V** using **Vagrant** without third-party hypervisor conflicts (No VirtualBox slow emulation issues).

---

## 📌 Architecture & Node Specifications

| Node | Role | OS | vCPU | RAM Allocated | Container Runtime | Kubernetes Version | CNI Plugin |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `k8s-control` | Control Plane (Master) | Ubuntu 22.04 LTS | 2 | 2.5 GB | `containerd` | `v1.31.x` | Flannel |
| `k8s-worker1` | Worker Node | Ubuntu 22.04 LTS | 2 | 2.0 GB | `containerd` | `v1.31.x` | Flannel |

* **Total Resource Footprint:** ~4.5 GB RAM, ~8.5 GB Disk space (utilizes Hyper-V **Linked Clones** / Differencing Disks).
* **Isolation:** 100% independent Linux VMs running at bare-metal hardware virtualization speeds.

---

## ✨ Features

- **100% CKA Exam Compliant:** Real Ubuntu Linux environment supporting `kubeadm upgrade`, `systemd` / `kubelet` troubleshooting, `etcdctl` snapshot backup & restore, and static pod manifests.
- **Native Hyper-V Performance:** Eliminates the notorious VirtualBox Native Execution Mode (NEM) CPU soft-lockup bug on Windows 10/11.
- **Disk-Optimized (Linked Clones):** Uses differencing disks (`linked_clone = true`) to save >15GB of disk storage.
- **Pre-Configured CKA Productivity Aliases:**
  - `alias k=kubectl`
  - Bash completion on `Tab` key for `kubectl` & `k`
  - `$do` shorthand for `--dry-run=client -o yaml`
  - `$now` shorthand for `--force --grace-period=0`
- **One-Click Desktop Integration:** Start and stop shortcuts generated directly on your Windows Desktop.

---

## 🛠️ Prerequisites

1. **Operating System:** Windows 10 / 11 Pro, Enterprise, or Education (64-bit).
2. **Hardware Virtualization:** Enabled in BIOS/UEFI (`Intel VT-x` or `AMD SVM`).
3. **Hyper-V Enabled on Windows:**
   Open PowerShell as Administrator:
   ```powershell
   Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All
   ```
4. **Vagrant Installed:**
   ```powershell
   winget install Hashicorp.Vagrant
   ```

---

## ⚡ Quick Start

### 1. Clone the Repository
```powershell
git clone https://github.com/mahersavara/cka-hyperv-vagrant-lab.git
cd cka-hyperv-vagrant-lab
```

### 2. Generate Desktop Shortcuts (Optional)
Run in PowerShell to create `CKA Kubernetes Lab` and `Stop CKA Lab` on your Desktop:
```powershell
powershell -ExecutionPolicy Bypass -File .\setup-shortcuts.ps1
```

### 3. Start the Cluster
Double-click **`CKA Kubernetes Lab`** on your Desktop, OR run in terminal:
```powershell
.\start-lab.bat
```
*Vagrant will automatically download the Ubuntu image, bootstrap both nodes via `kubeadm`, configure Flannel networking, and SSH into the control-plane node.*

---

## 🖥️ Usage & Handy Commands

### Verify Cluster Status
Inside the `master` node terminal:
```bash
# Check all nodes
k get nodes -o wide

# Check all pods in all namespaces
k get pods -A
```

### Fast Manifest Generation (CKA Exam Style)
```bash
# Create a Pod YAML template
k run nginx --image=nginx $do > pod.yaml

# Create a Deployment YAML template
k create deploy web --image=nginx --replicas=3 $do > deploy.yaml

# Force delete a Pod instantly
k delete pod nginx $now
```

### Switch to Root
```bash
sudo -i
```

### SSH to Worker Node
```bash
ssh k8s-worker1
```

---

## 🛑 Stopping & Resetting the Lab

### Safely Shut Down (Reclaims all RAM & CPU)
Double-click **`Stop CKA Lab`** on your Desktop, OR run:
```powershell
.\stop-lab.bat
```

### Completely Reset / Rebuild the Cluster from Scratch
If you want a brand new, clean cluster for mock exams:
```powershell
vagrant destroy -f
vagrant up --provider=hyperv
```

---

## 📂 Project Structure

```
├── Vagrantfile               # Hyper-V multi-node cluster definition
├── scripts/
│   ├── common.sh             # Runtime setup, kernel modules, sysctl, K8s packages
│   ├── master.sh             # Kubeadm init, Flannel CNI, kubeconfig, CKA aliases
│   └── worker.sh             # Dynamic cluster join script
├── start-lab.bat             # Desktop launcher script
├── stop-lab.bat              # Safe shutdown script
├── setup-shortcuts.ps1       # Automatic Desktop shortcut creator
├── .gitignore                # Excludes transient Vagrant & VHDX state
└── README.md                 # Complete documentation
```

---

## 📜 License
MIT License. Free for educational and personal CKA preparation.
