#!/bin/bash
set -e

echo "[1/2] Lay join token tu Master node qua SSH..."
export DEBIAN_FRONTEND=noninteractive

# Cho den khi phan giai va ket noi duoc toi master node
MASTER_HOST="k8s-control"
while ! sshpass -p 'vagrant' ssh -o StrictHostKeyChecking=no vagrant@$MASTER_HOST "test -f /home/vagrant/join.sh" 2>/dev/null; do
  echo "Dang cho Master node ($MASTER_HOST) san sang..."
  sleep 3
done

sshpass -p 'vagrant' scp -o StrictHostKeyChecking=no vagrant@$MASTER_HOST:/home/vagrant/join.sh /tmp/join.sh

echo "[2/2] Ket noi vao Cluster k8s..."
bash /tmp/join.sh

# Bash completion & alias
if ! grep -q "alias k=kubectl" /home/vagrant/.bashrc; then
  cat <<'EOF' >> /home/vagrant/.bashrc
source <(kubectl completion bash) 2>/dev/null || true
alias k=kubectl
complete -o default -F __start_kubectl k 2>/dev/null || true
export do="--dry-run=client -o yaml"
export now="--force --grace-period=0"
EOF
fi

echo "Worker node da ket noi vao Cluster thanh cong!"
