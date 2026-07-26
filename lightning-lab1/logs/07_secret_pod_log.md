# Nhật ký Thực hành: Tạo Pod Mount Secret `secret-1401`

Tài liệu này ghi lại các lệnh gõ thực tế và lưu ý kiểm tra khi thực hành bài Mount Secret trên KodeKloud.

---

## 💻 Các lệnh đã thực thi

1. **Chỉnh sửa file cấu hình yaml:**
   ```bash
   nano /tmp/secret-pod.yaml
   ```

2. **Áp dụng cấu hình tạo Pod:**
   ```bash
   k apply -f /tmp/secret-pod.yaml
   ```
   *Output: `pod/secret-1401 created`*

3. **Kiểm tra trạng thái Pod:**
   ```bash
   k get pods -n admin1401 -o wide
   ```
   *Output:*
   ```text
   NAME          READY   STATUS    RESTARTS   AGE   IP            NODE     
   secret-1401   1/1     Running   0          17s   172.17.1.20   node01   
   ```

4. **Kiểm tra nội dung Secret bên trong Pod:**
   *Lưu ý lỗi cú pháp:* Khi chạy lệnh `kubectl exec`, các tham số chạy bên trong Container phải đứng sau dấu cách `--`.
   * Lệnh sai: `k exec -n admin1401 secret-1401 --ls /etc/secret-volume` (Lỗi `--ls` bị hiểu lầm là cờ của kubectl).
   * Lệnh đúng: `k exec -n admin1401 secret-1401 -- ls /etc/secret-volume`

5. **Mẹo xem file ẩn (Dotfiles) của Secret:**
   Vì Secret trong bài mẫu có tên key là `.secret-file` (bắt đầu bằng dấu chấm), đây là **file ẩn** trong hệ điều hành Linux. Lệnh `ls` thông thường sẽ không hiển thị gì cả.
   * Để xem được file ẩn, em bắt buộc phải dùng thêm cờ `-a` hoặc `-la`:
     ```bash
     k exec -n admin1401 secret-1401 -- ls -la /etc/secret-volume
     ```
   * Để xem nội dung bên trong file ẩn đó:
     ```bash
     k exec -n admin1401 secret-1401 -- cat /etc/secret-volume/.secret-file
     ```
