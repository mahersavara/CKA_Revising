# Nhật ký Thực hành Mock Exam 1 - Câu 6: Troubleshoot Init Container Pod `orange`

Tài liệu này lưu trữ quá trình gỡ lỗi lỗi chính tả lệnh `sleeeep` trong Init Container của Pod `orange` thành công.

---

## 💻 Các lệnh đã thực thi

1. **Phát hiện trạng thái Pod lỗi:**
   ```bash
   k get pods -A | grep orange
   ```
   *Output:* Pod `orange` có trạng thái `Init:Error`.

2. **Dò lỗi chi tiết:**
   ```bash
   k describe pod orange
   ```
   *Phát hiện lỗi:* Exit Code 127, lệnh chạy bị typo `sleeeep 2`.

3. **Thử chỉnh sửa trực tiếp và ghi lại file sửa đổi:**
   ```bash
   k edit pod orange
   ```
   *(Nhận xét: Do trường container trong Pod là bất biến, việc edit trực tiếp báo lỗi, nhưng kubectl đã lưu lại bản sửa đổi nháp của người dùng vào `/tmp/kubectl-edit-334036006.yaml`).*

4. **Xóa Pod cũ bị lỗi (Xóa nhanh bằng force):**
   ```bash
   k delete pod orange --force
   ```

5. **Áp dụng file YAML nháp đã sửa lỗi `sleep 2` để tạo Pod mới:**
   ```bash
   k apply -f /tmp/kubectl-edit-334036006.yaml
   ```
   *Output:* `pod/orange created`

6. **Kiểm tra trạng thái cuối cùng:**
   ```bash
   k get pods orange
   ```
   *Output thực tế:*
   ```text
   NAME     READY   STATUS    RESTARTS   AGE
   orange   1/1     Running   0          6s
   ```
   *(Kết quả: Pod `orange` đã chuyển sang Running thành công).*
