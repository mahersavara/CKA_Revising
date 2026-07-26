# Lời giải Chi tiết & Mẹo thi: CKA Lightning Lab 1

Dưới đây là lời giải chi tiết cho các câu hỏi trong Lightning Lab 1, được tối ưu hóa cho môi trường thi thực tế và hệ thống lab KodeKloud.

---

## ⚡ Câu 1: Cluster Upgrade (Nâng cấp Controlplane Node)
*Mẹo thi: Bạn luôn được phép truy cập trang tài liệu chính thức `kubernetes.io/docs` trong lúc thi. Từ khóa tìm kiếm nhanh: "Upgrading kubeadm clusters".*

### Quy trình các bước thực hiện trên controlplane node:

1. **Drain node (Chuyển các pod đi nơi khác và đánh dấu node không nhận thêm pod mới):**
   ```bash
   kubectl drain controlplane --ignore-daemonsets
   ```

2. **Cập nhật và nâng cấp công cụ `kubeadm`:**
   Trước tiên, kiểm tra các phiên bản có sẵn (nếu cần):
   ```bash
   apt-update && apt-cache policy kubeadm
   ```
   Bỏ khóa gói (unhold), cài đặt phiên bản chỉ định (ví dụ `1.30.1-1.1` hoặc `1.30.1-00` tùy repo), rồi khóa lại (hold):
   ```bash
   apt-mark unhold kubeadm
   apt-get update && apt-get install -y kubeadm=1.30.1-1.1
   apt-mark hold kubeadm
   ```

3. **Kiểm tra kế hoạch nâng cấp và thực hiện nâng cấp:**
   ```bash
   kubeadm upgrade plan
   sudo kubeadm upgrade apply v1.30.1
   ```
   *(Nhấn `y` khi được hỏi để xác nhận nâng cấp)*.

4. **Nâng cấp Kubelet & Kubectl trên controlplane node:**
   ```bash
   apt-mark unhold kubelet kubectl
   apt-get install -y kubelet=1.30.1-1.1 kubectl=1.30.1-1.1
   apt-mark hold kubelet kubectl
   ```

5. **Khởi động lại tiến trình Kubelet:**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl restart kubelet
   ```

6. **Uncordon node (Cho phép nhận pod trở lại):**
   ```bash
   kubectl uncordon controlplane
   ```

---

## ⚡ Câu 2: Backup and Restore ETCD
*Mẹo thi: Lệnh backup/restore ETCD yêu cầu chứng chỉ TLS. Bạn phải tìm đúng đường dẫn cert/key trong file cấu hình tĩnh của etcd tại `/etc/kubernetes/manifests/etcd.yaml`.*

### Bước 1: Thu thập thông tin TLS từ `/etc/kubernetes/manifests/etcd.yaml`
Tìm các tham số sau:
- `--trusted-ca-file` (thường là `/etc/kubernetes/pki/etcd/ca.crt`)
- `--cert-file` (thường là `/etc/kubernetes/pki/etcd/server.crt`)
- `--key-file` (thường là `/etc/kubernetes/pki/etcd/server.key`)

### Bước 2: Chạy lệnh Backup
Sử dụng biến môi trường `ETCDCTL_API=3`:
```bash
ETCDCTL_API=3 etcdctl \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key \
  snapshot save /opt/etcd-backup.db
```
*Kiểm tra file snapshot đã tạo thành công chưa:*
```bash
ETCDCTL_API=3 etcdctl --write-out=table snapshot status /opt/etcd-backup.db
```

### Bước 3: Khôi phục (Restore) từ Snapshot cũ `/opt/etcd-backup-previous.db`
1. Khôi phục dữ liệu vào một thư mục data mới (ví dụ `/var/lib/etcd-new`):
   ```bash
   ETCDCTL_API=3 etcdctl \
     --data-dir=/var/lib/etcd-new \
     snapshot restore /opt/etcd-backup-previous.db
   ```
2. Thay đổi đường dẫn data directory trong `/etc/kubernetes/manifests/etcd.yaml`:
   Mở file này bằng `vi` hoặc `nano`:
   - Tìm phần `volumeMounts` của `etcd-data` và đổi `mountPath` hoặc phần `hostPath` trỏ đến `/var/lib/etcd-new`.
   - Cụ thể, sửa ở phần `volumes`:
     ```yaml
     - name: etcd-data
       hostPath:
         path: /var/lib/etcd-new  # Đổi từ /var/lib/etcd sang /var/lib/etcd-new
         type: DirectoryOrCreate
     ```
3. Đợi vài phút để API Server tự động khởi động lại etcd pod và nhận cấu hình mới.

---

## ⚡ Câu 3: Tạo Static Pod
*Mẹo thi: Static Pod được quản lý bởi kubelet thông qua thư mục manifests tĩnh (thường là `/etc/kubernetes/manifests`). Chỉ cần bỏ file yaml của Pod vào đây, kubelet sẽ tự động tạo pod.*

### Các bước thực hiện:
1. Xem đường dẫn chứa manifest của static pod bằng cách kiểm tra file cấu hình kubelet:
   ```bash
   grep -i staticPodPath /var/lib/kubelet/config.yaml
   # Kết quả thường là: staticPodPath: /etc/kubernetes/manifests
   ```
2. Tạo file định nghĩa Pod bằng cách sử dụng `dry-run`:
   ```bash
   kubectl run static-web --image=nginx --dry-run=client -o yaml > /etc/kubernetes/manifests/static-web.yaml
   ```
3. Kubelet sẽ tự động quét thư mục này và tạo Pod. Tên của static pod hiển thị trên cụm sẽ có hậu tố tên node (ví dụ: `static-web-controlplane`).

---

## ⚡ Câu 4: Troubleshooting Node `node01` (NotReady)
*Mẹo thi: Khi một node ở trạng thái `NotReady`, quy trình kiểm tra chuẩn luôn là:*
1. **Kiểm tra trạng thái node:** `kubectl describe node node01` (xem phần `Conditions` xem bị lỗi gì, ví dụ: DiskPressure, MemoryPressure, NetworkUnavailable, v.v.).
2. **SSH vào node lỗi:** `ssh node01`
3. **Kiểm tra tiến trình kubelet:** `systemctl status kubelet`
4. **Kiểm tra log của kubelet:** `journalctl -u kubelet -n 50 --no-pager`

### Các nguyên nhân phổ biến trên KodeKloud:
* Kubelet bị stop: Hãy chạy `systemctl enable --now kubelet` hoặc `systemctl start kubelet`.
* Sai đường dẫn cấu hình hoặc sai certificates: Check `/etc/kubernetes/kubelet.conf` hoặc `/var/lib/kubelet/config.yaml`.
* Tiến trình container runtime (containerd hoặc docker) bị dừng: `systemctl status containerd`.
