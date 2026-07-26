# Chuyên đề 7: Nâng Cấp Master Node - Kubeadm, Kubelet & Kubectl (Câu 49)

Bài nâng cấp cluster (cluster upgrade) luôn xuất hiện trong đề thi CKA thực tế. Đề bài yêu cầu bạn nâng cấp toàn bộ thành phần điều khiển (control plane) và kubelet/kubectl trên **Master Node** duy nhất từ phiên bản **1.20.0** lên **1.20.1** (hoặc một phiên bản bất kỳ tùy kỳ thi).

---

## ⚠️ Quy tắc Vàng khi nâng cấp:
1. **Thứ tự nâng cấp:** `kubeadm` nâng cấp trước -> Thực hiện `kubeadm upgrade apply` -> Nâng cấp `kubelet` và `kubectl` -> Khởi động lại service.
2. **Không được nâng cấp Worker Node** hoặc các dịch vụ khác (etcd, CNI...) trừ khi đề bài yêu cầu cụ thể.
3. **Drain node trước** khi thực hiện nâng cấp và **Uncordon** sau khi hoàn thành.

---

## 🛠️ Quy trình thực hiện từng bước

Giả sử Master Node tên là `k8s-master` (trong đề bài của SurePass ví dụ là `k8s-master` hoặc kết nối qua `ssh ek8s` / `ssh mk8s-master-0`).

### Bước 1: Cô lập Master Node từ máy kiểm tra (host máy thi)
Trước khi nâng cấp, ta cần đảm bảo không có Pod nghiệp vụ chạy trên Master Node bằng cách Drain:
```bash
# Đánh dấu cordon
kubectl cordon k8s-master

# Drain node (Loại bỏ các Pod đang chạy)
kubectl drain k8s-master --delete-local-data --ignore-daemonsets --force
# (Trong các bản K8s mới, thay --delete-local-data bằng --delete-emptydir-data)
```

### Bước 2: SSH vào Master Node cần nâng cấp
```bash
ssh ek8s
# Chuyển sang quyền root
sudo -i
```

### Bước 3: Nâng cấp Kubeadm lên phiên bản 1.20.1
* **Dành cho hệ điều hành Ubuntu/Debian:**
  ```bash
  apt-get update
  apt-get install -y --allow-change-held-packages kubeadm=1.20.1-00
  # Hoặc dùng flag chặn loại trừ của apt:
  # apt-get install kubeadm=1.20.1-00 --disableexcludes=kubernetes
  ```
* **Kiểm tra phiên bản kubeadm đã lên đúng chưa:**
  ```bash
  kubeadm version
  ```

### Bước 4: Thực hiện Kubeadm Upgrade Plan & Apply
Chạy lệnh kiểm tra tính tương thích và các phiên bản nâng cấp có sẵn:
```bash
kubeadm upgrade plan
```
Áp dụng nâng cấp các thành phần của Control Plane (API Server, Controller Manager, Scheduler...):
```bash
kubeadm upgrade apply v1.20.1
# (Hoặc cấu hình không nâng cấp etcd nếu đề bài yêu cầu: --etcd-upgrade=false)
```
*Chờ vài phút để các Pod static thuộc hệ thống khởi động lại.*

### Bước 5: Nâng cấp Kubelet và Kubectl trên Master Node
Sau khi Control Plane nâng cấp thành công, ta tiếp tục nâng cấp Kubelet (chạy các Pod) và Kubectl (công cụ CLI):
```bash
apt-get install -y --allow-change-held-packages kubelet=1.20.1-00 kubectl=1.20.1-00
```
Khởi động lại tiến trình hệ thống và Kubelet:
```bash
systemctl daemon-reload
systemctl restart kubelet
```

### Bước 6: Thoát Master Node và Uncordon Node
Thoát phiên làm việc SSH để quay lại máy chủ ban đầu:
```bash
exit   # Thoát quyền root
exit   # Thoát SSH
```
Tại máy kiểm tra, cho phép Master Node lập lịch bình thường trở lại:
```bash
kubectl uncordon k8s-master
```

---

## 🔍 Kiểm tra kết quả (Verification)

Kiểm tra danh sách các Node trong hệ thống:
```bash
kubectl get nodes
```
*Kết quả mong muốn:* Master Node hiển thị phiên bản `v1.20.1` ở cột **VERSION** và trạng thái là **Ready**.
```text
NAME         STATUS   ROLES    AGE   VERSION
k8s-master   Ready    master   77d   v1.20.1
k8s-node-0   Ready    <none>   77d   v1.20.0
```
*(Worker Node vẫn giữ nguyên phiên bản cũ v1.20.0 là hoàn toàn chính xác).*
