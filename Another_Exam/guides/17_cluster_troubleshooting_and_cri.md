# Chuyên đề 17: Khắc Phục Lỗi Cụm - Cluster Troubleshooting, Kubeadm Bootstrapping và CRI Setup (Câu 3, 32, 47, 55, 56, 72)

Chuyên đề này hướng dẫn các kỹ thuật xử lý sự cố (troubleshooting) hệ thống nâng cao trong kỳ thi CKA, bao gồm: Sửa lỗi API Server mất kết nối ETCD sau khi di chuyển máy chủ, khắc phục tiến trình Kubelet bị dừng trên Worker Node, cài đặt CRI-dockerd và cấu hình mạng Kernel, và khởi tạo cụm Kubernetes bằng Kubeadm.

---

## 🛠️ 1. Sửa lỗi API Server mất kết nối ETCD (Câu 3)

**Đề bài:** Một cụm Kubernetes chạy ETCD ngoài (external etcd) vừa được di chuyển sang máy chủ mới. Cụm điều khiển (control plane) bị lỗi không hoạt động được. Bạn cần chẩn đoán và khắc phục.

### Phân tích sự cố:
Khi di chuyển máy chủ, địa chỉ IP của máy chủ ETCD ngoài hoặc đường dẫn lưu chứng chỉ TLS thường bị thay đổi. API Server sẽ không thể khởi chạy nếu không kết nối được tới ETCD.

### Quy trình xử lý:
1. SSH vào Master Node:
   ```bash
   ssh cka000059
   ```
2. Kiểm tra trạng thái của API Server bằng Docker hoặc Containerd:
   ```bash
   # Nếu dùng containerd làm CRI:
   sudo crictl ps -a | grep apiserver
   # Nếu dùng docker:
   sudo docker ps -a | grep apiserver
   ```
   Nếu thấy container API Server liên tục khởi động lại (CrashLoopBackOff) hoặc không chạy, ta cần kiểm tra file cấu hình Static Pod của nó.
3. Mở file cấu hình API Server:
   ```bash
   sudo nano /etc/kubernetes/manifests/kube-apiserver.yaml
   ```
4. Tìm cờ cấu hình kết nối ETCD: `--etcd-servers`. Kiểm tra xem IP có khớp với IP của máy chủ ETCD mới không:
   ```yaml
   - --etcd-servers=https://<IP-ETCD-MOI>:2379
   ```
5. Đồng thời, kiểm tra kỹ các đường dẫn chứng chỉ TLS kết nối ETCD xem có bị chỉ định sai thư mục không:
   ```yaml
   - --etcd-cafile=/etc/kubernetes/pki/etcd/ca.crt
   - --etcd-certfile=/etc/kubernetes/pki/apiserver-etcd-client.crt
   - --etcd-keyfile=/etc/kubernetes/pki/apiserver-etcd-client.key
   ```
6. Lưu file. Kubelet sẽ tự động tải lại cấu hình và khởi chạy lại API Server. Kiểm tra lại trạng thái cụm:
   ```bash
   kubectl get nodes
   kubectl get componentstatuses
   ```

---

## 🔍 2. Sửa lỗi Kubelet bị dừng trên Worker Node (Câu 32, 47, 55)

**Đề bài:** Một Worker Node (ví dụ `wk8s-node-0` hoặc `bk8s-node-0`) có trạng thái `NotReady`. Bạn phải sửa lỗi để Node quay lại trạng thái `Ready` một cách vĩnh viễn.

### Quy trình xử lý lỗi:
1. SSH vào Node bị lỗi:
   ```bash
   ssh wk8s-node-0
   sudo -i
   ```
2. Kiểm tra trạng thái dịch vụ `kubelet` quản lý bởi systemd:
   ```bash
   systemctl status kubelet
   ```
   * **Trường hợp A (Kubelet bị dừng - Active: inactive/dead):**
     Đây là lỗi đơn giản nhất. Chỉ cần khởi động lại và thiết lập tự động chạy cùng hệ thống:
     ```bash
     systemctl start kubelet
     systemctl enable kubelet
     ```
   * **Trường hợp B (Kubelet bị lỗi khởi động - Active: failed):**
     Ta cần đọc log hệ thống để chẩn đoán nguyên nhân:
     ```bash
     journalctl -u kubelet -n 50 -f
     ```
     *Lưu ý các lỗi phổ biến trong log:*
     * *Sai đường dẫn cấu hình:* Kiểm tra cấu hình kubelet trỏ đúng file config `/var/lib/kubelet/config.yaml`.
     * *Lỗi chứng chỉ (expired certs hoặc sai thư mục):* Xem kỹ log có lỗi về TLS handshake hoặc thiếu file `/var/lib/kubelet/pki/...` không. Sửa lại đường dẫn trong file service cấu hình hoặc chạy lại `kubeadm join` nếu cần.
3. Sau khi sửa xong cấu hình, nạp lại daemon và khởi động lại dịch vụ:
   ```bash
   systemctl daemon-reload
   systemctl restart kubelet
   systemctl enable kubelet
   ```
4. Thoát khỏi Node và kiểm tra trạng thái trên máy host:
   ```bash
   kubectl get nodes
   # Đợi 1-2 phút, Node sẽ chuyển từ NotReady sang Ready.
   ```

---

## 🐳 3. Cài đặt CRI-dockerd và cấu hình Tham số Kernel (Câu 56)

**Đề bài:** Cấu hình hệ thống Linux chuẩn bị cài Kubernetes sử dụng Docker làm runtime. Yêu cầu cài đặt gói `cri-dockerd` từ file Debian có sẵn, khởi động dịch vụ và cấu hình thông số cầu nối mạng Kernel.

### Quy trình thực hiện:
1. SSH vào máy host:
   ```bash
   ssh cka000051
   sudo -i
   ```
2. Cài đặt gói Debian `cri-dockerd` bằng công cụ `dpkg`:
   ```bash
   dpkg -i ~/cri-dockerd_0.3.9.3-0.ubuntu-jammy_amd64.deb
   ```
3. Kích hoạt và khởi động dịch vụ `cri-docker`:
   ```bash
   systemctl daemon-reload
   systemctl enable cri-docker.service
   systemctl enable --now cri-docker.socket
   ```
4. Cấu hình tham số Kernel liên quan đến cầu nối mạng (Bridge Networking):
   Kubernetes yêu cầu luồng mạng đi qua bridge phải được xử lý bởi iptables.
   ```bash
   # Thiết lập tham số tạm thời trong kernel
   sysctl -w net.bridge.bridge-nf-call-iptables=1
   
   # Ghi cấu hình vĩnh viễn để tránh bị mất khi khởi động lại máy
   echo "net.bridge.bridge-nf-call-iptables = 1" >> /etc/sysctl.d/99-kubernetes-cri.conf
   
   # Load lại cấu hình sysctl
   sysctl --system
   ```

---

## 🚀 4. Khởi tạo Cụm (Bootstrap) bằng Kubeadm và Join Node (Câu 72)

**Đề bài:** Khởi tạo Master Node `ik8s-master-0` dùng file cấu hình `/etc/kubeadm.conf`. Cài đặt Calico CNI và thêm Worker Node `ik8s-node-0` vào cụm.

### Quy trình thực hiện:

#### Bước 1: Khởi tạo Master Node
SSH vào Master Node:
```bash
ssh ik8s-master-0
sudo -i
```
Khởi tạo cụm bằng file config chỉ định và bỏ qua các lỗi kiểm tra tiền kỳ (preflight errors):
```bash
kubeadm init --config=/etc/kubeadm.conf --ignore-preflight-errors=all
```
*Lưu ý:* Sau khi lệnh chạy thành công, màn hình sẽ hiển thị lệnh `kubeadm join ... --token ... --discovery-token-ca-cert-hash ...`. Bạn **phải copy** lệnh này lại để dùng cho Worker Node.

#### Bước 2: Thiết lập quyền quản trị (Kubeconfig) cho root
```bash
mkdir -p $HOME/.kube
cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
chown $(id -u):$(id -g) $HOME/.kube/config
```

#### Bước 3: Cài đặt mạng Calico CNI
Áp dụng manifest Calico được cung cấp:
```bash
kubectl apply -f https://docs.projectcalico.org/v3.14/manifests/calico.yaml
```

#### Bước 4: Join Worker Node vào cụm
Mở một cửa sổ terminal mới, SSH vào Worker Node:
```bash
ssh ik8s-node-0
sudo -i
```
Dán lệnh `kubeadm join` đã copy ở Bước 1 vào, nhớ thêm cờ `--ignore-preflight-errors=all` vào cuối lệnh:
```bash
kubeadm join <IP-MASTER>:6443 --token <token-cua-ban> \
  --discovery-token-ca-cert-hash sha256:<hash-cua-ban> \
  --ignore-preflight-errors=all
```
Sau khi thấy thông báo join thành công, gõ `exit` để thoát.

#### Bước 5: Kiểm tra trạng thái cụm
Quay lại Master Node và chạy lệnh:
```bash
kubectl get nodes
```
Đợi vài phút cho đến khi cả hai Node `ik8s-master-0` và `ik8s-node-0` đều ở trạng thái **Ready**.
