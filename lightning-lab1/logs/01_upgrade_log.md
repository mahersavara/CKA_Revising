# Nhật ký Thực hành Nâng cấp Cụm (Kubernetes v1.34.0 -> v1.35.0)

Tài liệu này lưu trữ toàn bộ các lệnh và output thực tế khi thực hiện nâng cấp cụm Kubernetes trên KodeKloud để làm tài liệu tham khảo nhanh (Cheat Sheet) khi ôn thi CKA.

---

## 🖥️ Phần 1: Thực hiện trên Node `controlplane`

### 1. Drain node controlplane
```bash
k drain controlplane --ignore-daemonsets --delete-emptydir-data --force 
```
*Output:*
```text
node/controlplane cordoned
Warning: ignoring DaemonSet-managed Pods: kube-system/canal-4vtx2, kube-system/kube-proxy-m2p2v
evicting pod kube-system/coredns-6678bcd974-jjq24
evicting pod kube-system/coredns-6678bcd974-b42ll
evicting pod kube-system/calico-kube-controllers-587f6db6c5-v24tp
pod/calico-kube-controllers-587f6db6c5-v24tp evicted
pod/coredns-6678bcd974-jjq24 evicted
pod/coredns-6678bcd974-b42ll evicted
node/controlplane drained
```

### 2. Cập nhật Repository từ v1.34 sang v1.35
```bash
sudo sed -i 's/v1.34/v1.35/g' /etc/apt/sources.list.d/kubernetes.list 
sudo apt-get update
```

### 3. Nâng cấp Kubeadm
```bash
apt-mark unhold kubeadm
apt-get install -y kubeadm=1.35.0-1.1
apt-mark hold kubeadm
```

### 4. Kiểm tra kế hoạch nâng cấp và Apply
```bash
kubeadm upgrade plan
sudo kubeadm upgrade apply v1.35.0 -y
```
*Output Apply thành công:*
```text
[upgrade] SUCCESS! A control plane node of your cluster was upgraded to "v1.35.0".
[upgrade] Now please proceed with upgrading the rest of the nodes by following the right order.
```

### 5. Nâng cấp Kubelet & Kubectl trên controlplane
```bash
apt-mark unhold kubelet kubectl
apt-get install -y kubelet=1.35.0-1.1 kubectl=1.35.0-1.1
apt-mark hold kubelet kubectl

systemctl daemon-reload
systemctl restart kubelet
```

### 6. Uncordon controlplane & Kiểm tra Taint
```bash
kubectl uncordon controlplane
k describe node controlplane | grep -i taints
```
*Output:*
```text
node/controlplane uncordoned
Taints:             <none>
```
*(Nếu có Taint, dùng lệnh sau để xóa: `k taint node controlplane node-role.kubernetes.io/control-plane-`)*

---

## 🖥️ Phần 2: Điều hướng Pod & Nâng cấp Node `node01`

### 1. Drain node01 để chuyển dịch Pod `gold-nginx` sang controlplane
```bash
k drain node01 --ignore-daemonsets --delete-emptydir-data --force 
```
*Output:*
```text
node/node01 cordoned
evicting pod default/gold-nginx-6cc8dd8958-xmm4l
...
pod/gold-nginx-6cc8dd8958-xmm4l evicted
node/node01 drained
```

### 2. Xác nhận Pod đã chạy trên controlplane
```bash
k get pods -o wide
```
*Output:*
```text
NAME                          READY   STATUS    RESTARTS   AGE     IP           NODE           
gold-nginx-6cc8dd8958-txvvm   1/1     Running   0          53s     172.17.0.6   controlplane   
```

### 3. SSH sang node01 và Nâng cấp Kubeadm
```bash
ssh node01
sudo sed -i 's/v1.34/v1.35/g' /etc/apt/sources.list.d/kubernetes.list 
sudo apt-get update
apt-mark unhold kubeadm
apt-get install -y kubeadm=1.35.0-1.1
apt-mark hold kubeadm
```

### 4. Upgrade Node bằng Kubeadm
```bash
sudo kubeadm upgrade node
```
*Output:*
```text
[upgrade/kubelet-config] The kubelet configuration for this node was successfully upgraded!
```

### 5. Nâng cấp Kubelet & Kubectl trên node01
```bash
apt-mark unhold kubelet kubectl
apt-get install -y kubelet=1.35.0-1.1 kubectl=1.35.0-1.1
apt-mark hold kubelet kubectl

systemctl daemon-reload
systemctl restart kubelet
exit
```

### 6. Uncordon node01 trên controlplane
```bash
kubectl uncordon node01
```

### 7. Kiểm tra trạng thái cuối cùng
```bash
k get nodes
```
*Output:*
```text
NAME           STATUS   ROLES           AGE   VERSION
controlplane   Ready    control-plane   93m   v1.35.0
node01         Ready    <none>          92m   v1.35.0
```
