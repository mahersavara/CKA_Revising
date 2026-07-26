# Nhật ký Thực hành Mock Exam 2 - Câu 11: Chọn và áp dụng NetworkPolicy phù hợp

Tài liệu này lưu trữ quá trình phân tích và áp dụng thành công NetworkPolicy `net-policy-3` từ các file mẫu trong thư mục `/root`.

---

## 💻 Các lệnh đã thực thi

1. **Xem nội dung các file NetworkPolicy mẫu:**
   ```bash
   cat /root/net-pol-1.yaml
   cat /root/net-pol-2.yaml
   cat /root/net-pol-3.yaml
   ```

2. **Phân tích các tùy chọn:**
   * **`net-policy-1` (Sai/Không khớp):** Sử dụng nhãn `access: allowed` không đặc thù cho namespace `frontend`.
   * **`net-policy-2` (Sai):** Cho phép cả traffic từ namespace `databases` (vi phạm yêu cầu chặn database).
   * **`net-policy-3` (Đúng):** Chỉ cho phép traffic từ namespace `frontend` có nhãn `name: frontend` đi vào cổng 80 của các Pod thuộc namespace `backend`.

3. **Áp dụng NetworkPolicy chính xác:**
   ```bash
   kubectl apply -f /root/net-pol-3.yaml
   ```
   *Output:* `networkpolicy.networking.k8s.io/net-policy-3 created`

4. **Xác nhận trạng thái NetworkPolicy trong namespace `backend`:**
   ```bash
   kubectl get netpol -n backend
   ```
   *Output thực tế:*
   ```text
   NAME           POD-SELECTOR   AGE
   net-policy-3   <none>         5s
   ```
   *(Nhận xét: Chính sách mạng net-policy-3 đã được triển khai chính xác để chỉ định tuyến cho frontend đi vào backend).*
