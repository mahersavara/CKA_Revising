#!/bin/bash
set -e

export DEBIAN_FRONTEND=noninteractive

echo "[1/5] Tat Swap..."
swapoff -a
sed -i '/swap/d' /etc/fstab

echo "[2/5] Cau hinh Kernel Modules va Sysctl..."
cat <<EOF | tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF

modprobe overlay
modprobe br_netfilter

cat <<EOF | tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF

sysctl --system > /dev/null 2>&1 || true

echo "[3/5] Cai dat Container Runtime (containerd) va cong cu mang (conntrack, socat, sshpass)..."
apt-get update -qq
apt-get install -y -qq apt-transport-https ca-certificates curl gpg containerd conntrack socat ebtables ipset sshpass > /dev/null

mkdir -p /etc/containerd
containerd config default | tee /etc/containerd/config.toml > /dev/null
sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml
systemctl restart containerd
systemctl enable containerd > /dev/null 2>&1

echo "[4/5] Cai dat Kubernetes Packages (v1.31)..."
K8S_VERSION="v1.31"
mkdir -p -m 755 /etc/apt/keyrings
curl -fsSL https://pkgs.k8s.io/core:/stable:/${K8S_VERSION}/deb/Release.key | gpg --dearmor --yes -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
echo "deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/${K8S_VERSION}/deb/ /" | tee /etc/apt/sources.list.d/kubernetes.list > /dev/null

apt-get update -qq
apt-get install -y -qq kubelet kubeadm kubectl > /dev/null
apt-mark hold kubelet kubeadm kubectl > /dev/null

echo "[5/5] Cau hinh Kubelet..."
NODE_IP=$(hostname -I | awk '{print $1}')
if [ -n "$NODE_IP" ]; then
  cat <<EOF | tee /etc/default/kubelet > /dev/null
KUBELET_EXTRA_ARGS=--node-ip=$NODE_IP
EOF
fi

systemctl daemon-reload
systemctl restart kubelet
