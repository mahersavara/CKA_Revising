# Lời giải Mock Exam 1 - Câu 4: Khởi tạo Service bằng lệnh Imperative (8 điểm)

Bài tập này kiểm tra kỹ năng kết nối mạng dịch vụ (Services & Networking) trong Kubernetes, cụ thể là tạo một Service để expose (công khai) một Pod đang chạy bằng các lệnh gõ nhanh (Imperative Commands).

---

## 🛠️ Quy trình thực hiện nhanh nhất (Imperative Command)

Để tạo nhanh Service trỏ đúng nhãn (labels) của Pod `messaging` mà không cần viết file YAML:

### Bước 1: Chạy lệnh `kubectl expose`
```bash
kubectl expose pod messaging \
  --name=messaging-service \
  --port=6379 \
  --type=ClusterIP
```

---

## 🔍 Tại sao dùng lệnh `kubectl expose` là tối ưu nhất?

1. **Tự động đồng bộ Nhãn (Labels / Selector):** 
   Lệnh `kubectl expose` sẽ tự động đọc nhãn của Pod mục tiêu (`messaging`) và cấu hình trường `selector` của Service trùng khớp hoàn toàn. Điều này giúp tránh lỗi gõ sai nhãn thủ công.
2. **Tiết kiệm thời gian:** Chỉ mất 2 giây chạy lệnh thay vì phải export YAML và chỉnh sửa thủ công.

---

## 🔍 Kiểm tra kết quả (Verification)

### 1. Kiểm tra cấu hình Service:
```bash
kubectl get svc messaging-service -o wide
```
*Trạng thái đúng:* TYPE phải là `ClusterIP`, PORT(S) là `6379/TCP`.

### 2. Kiểm tra xem Service đã trỏ đúng vào Pod chưa (Endpoints):
```bash
kubectl describe svc messaging-service
```
*Kết quả quan trọng nhất cần kiểm tra:*
* Trường **`Selector`** phải khớp với label của Pod `messaging` (Ví dụ: `run=messaging` hoặc `tier=msg`).
* Trường **`Endpoints`** phải hiển thị IP của Pod `messaging` (không được để trống `<none>`).
