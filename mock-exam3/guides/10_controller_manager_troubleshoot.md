# Lời giải Mock Exam 3 - Câu 10: Troubleshoot Kube-Controller-Manager (10 điểm)

Bài tập này kiểm tra kỹ năng chẩn đoán sự cố thành phần hệ thống (Control Plane Troubleshooting), cụ thể là xử lý tình huống các tài nguyên điều khiển (như Deployments) không tự động nhân bản (scale) khi có lệnh yêu cầu do bộ điều khiển trung tâm `kube-controller-manager` bị sập.

---

## 🔍 Quy trình chẩn đoán sự cố (Troubleshooting Workflow)

### Bước 1: Thử scale Deployment lên 3 replicas
```bash
kubectl scale deployment nginx-deploy --replicas=3
```

### Bước 2: Kiểm tra xem số lượng Pod có tăng lên không
```bash
kubectl get deployment nginx-deploy
kubectl get pods
```
*Kết quả:* Số lượng replica mong muốn (`DESIRED`) là `3`, nhưng số lượng Pod thực tế chạy (`READY`/`AVAILABLE`) **không đổi (vẫn là 1)** và không có Pod mới nào được khởi tạo ở trạng thái `Pending` hay `ContainerCreating`.

*Kết luận:* Bộ điều khiển trung tâm (Controller Manager) không hoạt động để xử lý sự kiện scale.

---

### Bước 3: Kiểm tra trạng thái Control Plane Pods
```bash
kubectl get pods -n kube-system
```
*Ghi nhận:* Pod **`kube-controller-manager-controlplane`** có thể đang ở trạng thái **`CrashLoopBackOff`**, **`Error`**, hoặc **hoàn toàn biến mất** khỏi danh sách.

### Bước 4: Kiểm tra cấu hình Static Pod của Controller Manager
Bộ điều khiển chạy dưới dạng Static Pod được quản lý qua file manifest tại `/etc/kubernetes/manifests/kube-controller-manager.yaml`.

1. **Kiểm tra xem file cấu hình có tồn tại không:**
   ```bash
   ls -la /etc/kubernetes/manifests/
   ```
   *(Nếu file bị đổi tên thành `.bak` hoặc di chuyển đi nơi khác, hãy đổi tên hoặc di chuyển nó về đúng thư mục `/etc/kubernetes/manifests/`).*

2. **Nếu file có sẵn, in nội dung để tìm lỗi chính tả:**
   ```bash
   cat /etc/kubernetes/manifests/kube-controller-manager.yaml
   ```

3. **Các lỗi sai cấu hình phổ biến (Common Typos):**
   * **Sai tên file Kubeconfig:** 
     * Trường `--kubeconfig` trỏ sai tên file (Ví dụ: `/etc/kubernetes/controller-manager.conf` bị viết nhầm thành `/etc/kubernetes/controller-manager-XXXX.conf` hoặc `/etc/kubernetes/kubernetes.conf`).
     * Hãy chạy `ls -la /etc/kubernetes/` để xem tên file chính xác đang tồn tại trên cụm (thường là `controller-manager.conf`).
   * **Lỗi chính tả cờ lệnh (Command Flag Typos):**
     * Ví dụ: `--leader-elect=true` bị gõ nhầm, hoặc các cờ khác bị viết sai cú pháp.
   * **Sai cấu hình Mount Path (Volume Mounts):**
     * Các đường dẫn mount đến certificate hoặc kubeconfig bị sai lệch so với hostPath trên Node.

---

## 🛠️ Quy trình sửa lỗi

1. **Sửa file manifest của kube-controller-manager:**
   ```bash
   sudo nano /etc/kubernetes/manifests/kube-controller-manager.yaml
   ```
   *(Sửa lại đúng trường bị gõ sai, ví dụ sửa đường dẫn file kubeconfig về đúng `/etc/kubernetes/controller-manager.conf`).*

2. **Lưu lại file và chờ Kubelet tự khởi động lại bộ điều khiển:**
   Khi file được lưu, `kubelet` sẽ tự động phát hiện thay đổi và dựng lại pod `kube-controller-manager-controlplane` trong khoảng 30-60 giây.

---

## 🔍 Kiểm tra kết quả (Verification)

1. **Xác nhận Pod của Controller Manager đã Running ổn định:**
   ```bash
   kubectl get pods -n kube-system | grep controller
   ```
2. **Kiểm tra xem Deployment đã tự động scale lên đủ 3 Pod chưa:**
   ```bash
   kubectl get deployment nginx-deploy
   kubectl get pods
   ```
   *Kết quả đúng:* Cột READY hiển thị **`3/3`** thành công.
