# Nhật ký Thực hành Mock Exam 1 - Câu 11: Khởi tạo Kubernetes Gateway API

Tài liệu này lưu trữ quá trình khởi tạo và kiểm tra Gateway `web-gateway` thành công trong namespace `nginx-gateway`.

---

## 💻 Các lệnh đã thực thi

1. **Khởi tạo file cấu hình `gateway.yaml`:**
   ```yaml
   apiVersion: gateway.networking.k8s.io/v1
   kind: Gateway
   metadata:
     name: web-gateway
     namespace: nginx-gateway
   spec:
     gatewayClassName: nginx
     listeners:
     - name: http
       protocol: HTTP
       port: 80
   ```

2. **Apply cấu hình:**
   ```bash
   k apply -f gateway.yaml
   ```
   *Output:* `gateway.gateway.networking.k8s.io/web-gateway created`

3. **Kiểm tra trạng thái (lưu ý bẫy Namespace):**
   * Lần 1: Chạy `k get gateway` -> Báo trống vì mặc định tìm ở `default`.
   * Lần 2: Chạy `k get gateway -A` -> Hiển thị chính xác:
     ```text
     NAMESPACE       NAME          CLASS   ADDRESS   PROGRAMMED   AGE
     nginx-gateway   web-gateway   nginx             True         11s
     ```
     *(Nhận xét: Trường PROGRAMMED = True xác nhận Gateway đã được cấu hình thành công trên proxy).*
