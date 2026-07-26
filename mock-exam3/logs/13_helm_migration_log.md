# Nhật ký Thực hành Mock Exam 3 - Câu 13: Cập nhật & Di cư Ứng dụng bằng Helm

Tài liệu này lưu trữ quá trình kiểm tra cú pháp và thực hiện cài đặt release mới `webpage-server-02` song song với việc gỡ bỏ release cũ `webpage-server-01` thành công.

---

## 💻 Các lệnh đã thực thi

1. **Tìm kiếm namespace của release cũ:**
   ```bash
   helm list -A
   ```
   *Kết quả:* Xác định namespace (ví dụ: `default`).

2. **Lint kiểm tra cấu trúc Chart mới:**
   ```bash
   helm lint /root/new-version
   ```
   *Output:* `1 chart(s) linted, 0 chart(s) failed`

3. **Cài đặt release mới:**
   ```bash
   helm install webpage-server-02 /root/new-version -n <namespace>
   ```
   *Output:* `NAME: webpage-server-02 ... STATUS: deployed`

4. **Gỡ bỏ release cũ:**
   ```bash
   helm uninstall webpage-server-01 -n <namespace>
   ```
   *Output:* `release "webpage-server-01" uninstalled`

5. **Xác nhận danh sách cuối cùng:**
   ```bash
   helm list -n <namespace>
   ```
   *Output thực tế:* Chỉ còn `webpage-server-02` hiển thị.
