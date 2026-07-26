# Lời giải Mock Exam 1 - Câu 6: Troubleshoot Init Container Pod `orange` (12 điểm)

Bài tập này kiểm tra kỹ năng chẩn đoán lỗi (Troubleshooting) và vòng đời Pod (Pod Lifecycle), cụ thể là xử lý lỗi của Init Container làm cản trở tiến trình khởi chạy Pod chính.

---

## 🔍 Quy trình phân tích & khắc phục sự cố (Troubleshooting Workflow)

### Bước 1: Phát hiện lỗi qua trạng thái Pod
Chạy lệnh kiểm tra pod:
```bash
kubectl get pods
```
*Kết quả:* Pod `orange` ở trạng thái **`Init:Error`** hoặc **`CrashLoopBackOff`** ở phần Init.

### Bước 2: Xem chi tiết cấu hình và log (Describe Pod)
```bash
kubectl describe pod orange
```
Kéo đến phần **`Init Containers`**:
* Container name: `init-myservice`
* Lệnh chạy (`Command`): `sh -c sleeeep 2;`
* Trạng thái (`State`): `Terminated` với `Reason: Error` và **`Exit Code: 127`** (Chỉ ra lỗi không tìm thấy câu lệnh - Command not found).
* **Kết luận:** Lệnh `sleep` bị viết sai chính tả thành `sleeeep`.

### Bước 3: Sửa lỗi (Xử lý tính chất bất biến - Immutability)
Vì cấu hình container trong Pod đang chạy là bất biến (immutable), ta không thể dùng lệnh `kubectl edit` để cập nhật trực tiếp. Ta bắt buộc phải **Export YAML -> Sửa file -> Xóa Pod cũ -> Tạo Pod mới**.

1. **Xuất cấu hình YAML của Pod ra file tạm:**
   ```bash
   kubectl get pod orange -o yaml > /tmp/orange.yaml
   ```
2. **Mở file bằng `nano /tmp/orange.yaml` để chỉnh sửa:**
   * Tìm dòng `sleeeep 2` sửa thành **`sleep 2`**.
   * Để file YAML sạch nhất khi tạo lại, em nên dọn dẹp các trường metadata do hệ thống sinh ra (như `uid`, `resourceVersion`, `creationTimestamp`, và khối `status:` ở cuối file).
3. **Xóa Pod cũ:**
   ```bash
   kubectl delete pod orange --force --grace-period=0
   ```
4. **Tạo lại Pod mới từ file YAML đã sửa:**
   ```bash
   kubectl apply -f /tmp/orange.yaml
   ```

---

## 🔍 Xác nhận kết quả (Verification)
```bash
kubectl get pods orange
```
*Kết quả:* Pod `orange` phải ở trạng thái **`Running` (1/1)** ổn định.
