# Nhật ký Thực hành Mock Exam 3 - Câu 12: Phân chia lưu lượng với Gateway API HTTPRoute

Tài liệu này lưu trữ quá trình kiểm tra thông số dịch vụ và triển khai HTTPRoute `web-route` để chia lưu lượng traffic tỷ lệ 80/20 thành công.

---

## 💻 Các lệnh đã thực thi

1. **Kiểm tra thông tin Gateway và Service:**
   ```bash
   kubectl get svc -A | grep web-service
   kubectl get gateway -A
   ```
   *Kết quả:* Xác nhận namespace và cổng hoạt động.

2. **Khởi tạo file cấu hình `/tmp/web-route.yaml`:**
   ```bash
   cat <<EOF > /tmp/web-route.yaml
   apiVersion: gateway.networking.k8s.io/v1
   kind: HTTPRoute
   metadata:
     name: web-route
     namespace: default
   spec:
     parentRefs:
     - name: web-gateway
     rules:
     - backendRefs:
       - name: web-service
         port: 80
         weight: 80
       - name: web-service-v2
         port: 80
         weight: 20
   EOF
   ```

3. **Apply cấu hình:**
   ```bash
   kubectl apply -f /tmp/web-route.yaml
   ```
   *Output:* `httproute.gateway.networking.k8s.io/web-route created`

4. **Xác nhận kết quả:**
   ```bash
   kubectl get httproute web-route -o yaml
   ```
   *(Nhận xét: HTTPRoute đã được liên kết với web-gateway và chia tải 80/20 cho web-service và web-service-v2).*
