# Nhật ký Thực hành Mock Exam 3 - Câu 5: Cấu hình Pod PriorityClass

Tài liệu này lưu trữ quá trình khởi tạo PriorityClass `low-priority` và áp dụng thành công mức độ ưu tiên này cho Pod `lp-pod` trong namespace `low-priority`.

---

## 💻 Các lệnh đã thực thi

1. **Tạo PriorityClass:**
   ```bash
   kubectl create priorityclass low-priority --value=50000 --description="Low priority class"
   ```
   *Output:* `priorityclass.scheduling.k8s.io/low-priority created`

2. **Xuất cấu hình Pod cũ:**
   ```bash
   kubectl get pod lp-pod -n low-priority -o yaml > /tmp/lp-pod.yaml
   ```

3. **Chỉnh sửa file cấu hình và dọn dẹp metadata:**
   * Thêm `priorityClassName: low-priority` vào khối `spec`.

4. **Xóa Pod cũ và khởi tạo Pod mới:**
   ```bash
   kubectl delete pod lp-pod -n low-priority --force
   ```
   *Output:* `pod "lp-pod" force deleted`
   ```bash
   kubectl apply -f /tmp/lp-pod.yaml
   ```
   *Output:* `pod/lp-pod created`

5. **Xác nhận kết quả:**
   ```bash
   kubectl get pod lp-pod -n low-priority -o yaml | grep -E "priorityClassName|priority:"
   ```
   *Output thực tế:*
   ```text
   priority: 50000
   priorityClassName: low-priority
   ```
   *(Nhận xét: Pod lp-pod đã được khởi tạo lại thành công và liên kết với PriorityClass có giá trị 50000).*
