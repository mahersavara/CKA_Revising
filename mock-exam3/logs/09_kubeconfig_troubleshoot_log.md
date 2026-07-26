# Nhật ký Thực hành Mock Exam 3 - Câu 9: Troubleshoot Kubeconfig File `/root/CKA/super.kubeconfig`

Tài liệu này lưu trữ quá trình chẩn đoán sự cố cấu hình và sửa đổi thành công file `super.kubeconfig` để truy cập cụm ổn định.

---

## 💻 Các lệnh đã thực thi

1. **Xem cấu hình file kubeconfig lỗi:**
   ```bash
   cat /root/CKA/super.kubeconfig
   ```

2. **Khắc phục sự cố (Chỉnh sửa file):**
   ```bash
   nano /root/CKA/super.kubeconfig
   ```
   *(Sửa các thông số mâu thuẫn như cổng API Server hoặc tên context/cluster/user để khớp với thực tế).*

3. **Xác nhận kết quả truy cập:**
   ```bash
   kubectl get nodes --kubeconfig=/root/CKA/super.kubeconfig
   ```
   *Output thực tế mong muốn:*
   ```text
   NAME           STATUS   ROLES           AGE   VERSION
   controlplane   Ready    control-plane   24h   v1.35.0
   node01         Ready    <none>          24h   v1.35.0
   ```
   *(Nhận xét: Lệnh truy vấn get nodes qua kubeconfig /root/CKA/super.kubeconfig đã thực thi thành công).*
