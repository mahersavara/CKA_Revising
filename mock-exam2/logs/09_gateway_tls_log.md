# Nhật ký Thực hành Mock Exam 2 - Câu 9: Cấu hình HTTPS TLS cho Gateway API

Tài liệu này lưu trữ quá trình sửa đổi đối tượng Gateway `web-gateway` để kích hoạt giao thức HTTPS trên cổng 443 kèm chứng chỉ TLS thành công trong namespace `cka5673`.

---

## 💻 Các lệnh đã thực thi

1. **Xem cấu hình Gateway ban đầu:**
   ```bash
   kubectl get gateway web-gateway -n cka5673 -o yaml
   ```
   *Nhận xét:* Gateway ban đầu chỉ cấu hình listener `http` trên cổng `80` và sử dụng `gatewayClassName: kodekloud`.

2. **Chỉnh sửa Gateway trực tiếp:**
   ```bash
   kubectl edit gateway web-gateway -n cka5673
   ```
   *Cấu hình đã sửa đổi trong khối spec.listeners:*
   ```yaml
   spec:
     gatewayClassName: kodekloud
     listeners:
     - allowedRoutes:
         namespaces:
           from: Same
       hostname: kodekloud.com
       name: https
       port: 443
       protocol: HTTPS
       tls:
         certificateRefs:
         - group: ""
           kind: Secret
           name: kodekloud-tls
         mode: Terminate
   ```

3. **Xác nhận cấu hình sau khi sửa:**
   ```bash
   kubectl get gateway web-gateway -n cka5673 -o yaml
   ```
   *(Nhận xét: Cấu hình đã được lưu và cập nhật chính xác bao gồm: port 443, protocol HTTPS, hostname kodekloud.com, và TLS Secret kodekloud-tls).*
