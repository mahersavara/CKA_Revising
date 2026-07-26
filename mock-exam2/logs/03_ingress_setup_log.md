# Nhật ký Thực hành Mock Exam 2 - Câu 3: Cấu hình Ingress Resource

Tài liệu này lưu trữ quá trình khởi tạo Ingress `webapp-ingress` và xác thực định tuyến traffic thành công đến host `kodekloud-ingress.app`.

---

## 💻 Các lệnh đã thực thi

1. **Khởi tạo Ingress bằng lệnh imperative:**
   ```bash
   k create ingress webapp-ingress \
     -n ingress-ns \
     --rule="kodekloud-ingress.app/=webapp-svc:80" \
     --class=nginx
   ```
   *Output:* `ingress.networking.k8s.io/webapp-ingress created`

2. **Kiểm tra trạng thái Ingress:**
   ```bash
   k get ingress -n ingress-ns
   ```
   *Output:*
   ```text
   NAME             CLASS   HOSTS                   ADDRESS   PORTS   AGE
   webapp-ingress   nginx   kodekloud-ingress.app             80      10s
   ```
   *(Nhận xét: Class là nginx, Host là kodekloud-ingress.app đã khớp cấu hình).*

3. **Kiểm tra kết nối bằng lệnh curl:**
   ```bash
   curl -s http://kodekloud-ingress.app/
   ```
   *Output thực tế:* Trả về thành công nội dung trang HTML chào mừng của nginx:
   ```html
   <!DOCTYPE html>
   <html>
   <head>
   <title>Welcome to nginx!</title>
   ...
   <h1>Welcome to nginx!</h1>
   ...
   ```
   *(Nhận xét: Ingress đã tiếp nhận traffic và chuyển tiếp thành công đến service backend).*
