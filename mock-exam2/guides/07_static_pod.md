# Lời giải Mock Exam 2 - Câu 7: Khởi tạo Static Pod trên Worker Node (10 điểm)

Bài tập này kiểm tra kỹ năng quản lý vòng đời Pod (Pod Lifecycle), cụ thể là tạo một **Static Pod** trên Worker Node (`node01`) được quản lý trực tiếp bởi tiến trình `kubelet` của Node đó thay vì Control Plane.

---

## 🛠️ Quy trình thực hiện (Step-by-step)

### Bước 1: Sinh nội dung file YAML của Pod trên `controlplane`
Tạo nhanh cấu trúc file YAML chuẩn cho Pod bằng lệnh `kubectl run` với cờ dry-run:
```bash
kubectl run nginx-critical --image=nginx --dry-run=client -o yaml > /tmp/nginx-critical.yaml
```

### Bước 2: Xem nội dung file YAML để chuẩn bị copy
```bash
cat /tmp/nginx-critical.yaml
```
*Nội dung file:*
```yaml
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: null
  labels:
    run: nginx-critical
  name: nginx-critical
spec:
  containers:
  - image: nginx
    name: nginx-critical
    resources: {}
  dnsPolicy: ClusterFirst
  restartPolicy: Always
status: {}
```

---

### Bước 3: SSH vào Worker Node `node01`
```bash
ssh node01
```
*(Nếu cần quyền root, hãy chạy `sudo -i` hoặc dùng `sudo` trước các lệnh sửa file).*

---

### Bước 4: Kiểm tra thư mục Static Pod Path của Kubelet
1. Xem file cấu hình của Kubelet để tìm đường dẫn thư mục Static Pod:
   ```bash
   sudo grep -i staticPodPath /var/lib/kubelet/config.yaml
   ```
   *Kết quả thường thấy:* `staticPodPath: /etc/kubernetes/manifests`
2. Tạo thư mục này nếu nó chưa tồn tại:
   ```bash
   sudo mkdir -p /etc/kubernetes/manifests
   ```

---

### Bước 5: Tạo file cấu hình Static Pod trên `node01`
Tạo file `/etc/kubernetes/manifests/nginx-critical.yaml` và dán nội dung YAML đã copy ở Bước 2 vào:
```bash
sudo vi /etc/kubernetes/manifests/nginx-critical.yaml
```
*(Hoặc dùng `sudo nano /etc/kubernetes/manifests/nginx-critical.yaml`).*

Dán cấu hình tối giản này vào và lưu lại:
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-critical
spec:
  containers:
  - name: nginx-critical
    image: nginx
```
*(Khi lưu file, `kubelet` trên `node01` sẽ tự động quét thư mục này và khởi chạy Pod trong vòng vài giây).*

---

### Bước 6: Thoát khỏi `node01` để quay lại `controlplane`
```bash
exit
```

---

## 🔍 Kiểm tra kết quả (Verification)

Trên `controlplane`, chạy lệnh kiểm tra danh sách Pod:
```bash
kubectl get pods -o wide
```

*Kết quả mong muốn:*
* Xuất hiện Pod có tên là **`nginx-critical-node01`** (Kubelet tự động nối thêm tên Node vào sau tên Static Pod).
* Trạng thái là **`Running`**.
* Cột `NODE` hiển thị chính xác là **`node01`**.
