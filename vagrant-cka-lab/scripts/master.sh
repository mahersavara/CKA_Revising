#!/bin/bash
set -e

CONTROL_IP=$(hostname -I | awk '{print $1}')
POD_CIDR="10.244.0.0/16"

if [ ! -f /etc/kubernetes/admin.conf ]; then
  echo "[1/4] Khoi tao Control Plane qua kubeadm init (IP: $CONTROL_IP)..."
  kubeadm init \
    --apiserver-advertise-address=$CONTROL_IP \
    --pod-network-cidr=$POD_CIDR \
    --node-name=k8s-control \
    --ignore-preflight-errors=NumCPU
fi

echo "[2/4] Thiet lap kubeconfig cho user vagrant & root..."
mkdir -p /home/vagrant/.kube
cp /etc/kubernetes/admin.conf /home/vagrant/.kube/config
chown -R vagrant:vagrant /home/vagrant/.kube

mkdir -p /root/.kube
cp /etc/kubernetes/admin.conf /root/.kube/config

echo "[3/4] Cai dat Flannel CNI..."
kubectl --kubeconfig=/etc/kubernetes/admin.conf apply -f https://github.com/flannel-io/flannel/releases/latest/download/kube-flannel.yml

echo "[4/4] Tao join script va cau hinh alias k=kubectl..."
kubeadm token create --print-join-command > /home/vagrant/join.sh
echo "$CONTROL_IP" > /home/vagrant/master_ip.txt
chmod 644 /home/vagrant/join.sh /home/vagrant/master_ip.txt

# Bash completion & alias cho ca vagrant va root
if ! grep -q "alias k=kubectl" /home/vagrant/.bashrc; then
  cat <<'EOF' >> /home/vagrant/.bashrc
source <(kubectl completion bash)
alias k=kubectl
complete -o default -F __start_kubectl k
export do="--dry-run=client -o yaml"
export now="--force --grace-period=0"
EOF
fi

if ! grep -q "alias k=kubectl" /root/.bashrc; then
  cat <<'EOF' >> /root/.bashrc
source <(kubectl completion bash)
alias k=kubectl
complete -o default -F __start_kubectl k
export do="--dry-run=client -o yaml"
export now="--force --grace-period=0"
EOF
fi

echo "Master node bootstrap hoan tat!"
