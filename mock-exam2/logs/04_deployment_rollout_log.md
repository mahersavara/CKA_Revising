# Nhật ký Thực hành Mock Exam 2 - Câu 4: Cập nhật Deployment dùng `kubectl apply`

Tài liệu này lưu trữ quá trình khởi tạo và nâng cấp Deployment `nginx-deploy` từ phiên bản `nginx:1.16` lên `nginx:1.17` sử dụng hoàn toàn lệnh `kubectl apply`.

---

## 💻 Các lệnh đã thực thi

1. **Khởi tạo file cấu hình `/tmp/nginx-deploy.yaml` (bản 1.16):**
   ```bash
   cat <<EOF > /tmp/nginx-deploy.yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: nginx-deploy
     namespace: default
   spec:
     replicas: 1
     selector:
       matchLabels:
         app: nginx-app
     template:
       metadata:
         labels:
           app: nginx-app
       spec:
         containers:
         - name: nginx
           image: nginx:1.16
   EOF
   ```

2. **Apply lần 1 để tạo Deployment:**
   ```bash
   kubectl apply -f /tmp/nginx-deploy.yaml
   ```
   *Output:* `deployment.apps/nginx-deploy created`

3. **Chỉnh sửa file cấu hình sang bản 1.17 bằng sed:**
   ```bash
   sed -i 's/nginx:1.16/nginx:1.17/g' /tmp/nginx-deploy.yaml
   ```

4. **Apply lần 2 để nâng cấp (update):**
   ```bash
   kubectl apply -f /tmp/nginx-deploy.yaml
   ```
   *Output:* `deployment.apps/nginx-deploy configured`

5. **Xác nhận kết quả:**
   ```bash
   kubectl describe deployment nginx-deploy | grep -i image
   ```
   *Output thực tế:*
   ```text
   Image:         nginx:1.17
   ```
   *(Nhận xét: Phiên bản container đã được nâng cấp thành công lên nginx:1.17 theo đúng phương pháp khai báo apply).*
