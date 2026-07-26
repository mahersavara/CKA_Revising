# Lời giải Mock Exam 3 - Câu 5: Cấu hình Pod PriorityClass (8 điểm)

Bài tập này kiểm tra kỹ năng điều phối tải (Scheduling), cụ thể là tạo một `PriorityClass` để gán mức độ ưu tiên cho Pod, giúp Kubernetes đưa ra quyết định giải phóng hoặc ưu tiên tài nguyên khi cụm bị quá tải.

---

## 🛠️ Quy trình thực hiện (Step-by-step)

### Bước 1: Tạo PriorityClass `low-priority` với giá trị `50000`
PriorityClass là tài nguyên có phạm vi toàn cụm (cluster-scoped), có thể tạo nhanh bằng lệnh gõ tắt:
```bash
kubectl create priorityclass low-priority \
  --value=50000 \
  --description="Low priority class"
```

---

### Bước 2: Xuất cấu hình Pod `lp-pod` hiện tại ra file tạm
Do thuộc tính mức độ ưu tiên (`priorityClassName`) trên Pod đang chạy là bất biến (immutable), ta bắt buộc phải xuất cấu hình ra YAML và tạo lại:
```bash
kubectl get pod lp-pod -n low-priority -o yaml > /tmp/lp-pod.yaml
```

### Bước 3: Chỉnh sửa file `/tmp/lp-pod.yaml`
1. Mở file bằng `nano`:
   ```bash
   nano /tmp/lp-pod.yaml
   ```
2. Tìm đến khối `spec:` và bổ sung trường **`priorityClassName: low-priority`**:
   ```yaml
   spec:
     priorityClassName: low-priority  # 👈 Thêm dòng này ở đây
     containers:
     ...
   ```
3. Khuyên dùng: Dọn dẹp các trường sinh tự động để tránh lỗi cấu hình:
   * Xóa khối `status:` ở cuối file.
   * Xóa các trường `uid`, `resourceVersion`, `creationTimestamp` trong mục `metadata:`.

*(Nhấn `Ctrl + O` -> `Enter` để lưu, và `Ctrl + X` để thoát).*

---

### Bước 4: Xóa Pod cũ và khởi tạo Pod mới
1. Xóa Pod cũ bằng lệnh force:
   ```bash
   kubectl delete pod lp-pod -n low-priority --force
   ```
2. Tạo lại Pod từ file đã chỉnh sửa:
   ```bash
   kubectl apply -f /tmp/lp-pod.yaml
   ```

---

## 🔍 Kiểm tra kết quả (Verification)

### 1. Kiểm tra PriorityClass đã hoạt động trên Pod chưa:
```bash
kubectl get pod lp-pod -n low-priority -o yaml | grep -i priority
```

*Kết quả mong muốn:*
* Trường `priorityClassName` hiển thị đúng **`low-priority`**.
* Trường `priority` hiển thị giá trị số tương ứng là **`50000`**.
