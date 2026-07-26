# Nhật ký Thực hành Mock Exam 1 - Câu 1: Multi-Container Pod

Tài liệu này lưu trữ quá trình gõ lệnh thực tế và sửa lỗi lề (indentation) khi thực hành câu 1 của Mock Exam 1.

---

## 💻 Các lệnh đã thực thi

1. **Khởi tạo và sửa lỗi cú pháp:**
   * Lần 1: Chạy `k apply -f /tmp/pods.yaml` báo lỗi:
     ```text
     Error from server (BadRequest): error when creating "/tmp/pods.yaml": Pod in version "v1" cannot be handled as a Pod: strict decoding error: unknown field "spec.containers[0].env[0].fieldRef"
     ```
     -> Lý do: Lỗi thụt lề sai của `fieldRef` (ngang hàng với `valueFrom` thay vì thụt lề vào trong).
   * Lần 2: Dùng `nano /tmp/pods.yaml` chỉnh sửa thụt lề chuẩn:
     ```yaml
         env:
         - name: NODE_NAME
           valueFrom:
             fieldRef:
               fieldPath: spec.nodeName
     ```

2. **Apply cấu hình thành công:**
   ```bash
   k apply -f /tmp/pods.yaml
   ```
   *Output:* `pod/mc-pod created`

3. **Xác nhận biến môi trường NODE_NAME:**
   ```bash
   k exec -n mc-namespace mc-pod -c mc-pod-1 -- env | grep NODE_NAME
   ```
   *Output:*
   ```text
   NODE_NAME=controlplane
   ```

4. **Xác nhận log in ra từ Sidecar container (`mc-pod-3`):**
   ```bash
   k logs -n mc-namespace mc-pod -c mc-pod-3
   ```
   *Output:* liên tục in ra các dòng thời gian thực mỗi giây:
   ```text
   Sun Jul 19 13:03:54 UTC 2026
   Sun Jul 19 13:03:55 UTC 2026
   ...
   ```
