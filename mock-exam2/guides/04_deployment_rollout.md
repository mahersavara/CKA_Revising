# Lời giải Mock Exam 2 - Câu 4: Cập nhật Deployment dùng `kubectl apply` (8 điểm)

Bài tập này kiểm tra kỹ năng quản lý phiên bản ứng dụng (Deployments & Rollouts), yêu cầu khởi tạo và nâng cấp phiên bản container bằng cách cập nhật file cấu hình YAML rồi áp dụng lệnh `kubectl apply`.

---

## 🛠️ Quy trình thực hiện (Dùng YAML & Apply)

⚠️ **Lưu ý đặc biệt:** Đề bài ghi rõ: *"Use the kubectl apply command to create or update the deployment"*. Do đó, em **không được dùng** lệnh `kubectl set image` hay `kubectl edit` để thay đổi trực tiếp trên cụm, mà phải sửa file cấu hình rồi chạy `kubectl apply`.

### Bước 1: Tạo file cấu hình ban đầu (nginx:1.16)
Em chạy khối lệnh tạo file `/tmp/nginx-deploy.yaml` với phiên bản `nginx:1.16` và số replica là `1`:

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

### Bước 2: Tạo Deployment trên cụm
```bash
kubectl apply -f /tmp/nginx-deploy.yaml
```

---

### Bước 3: Nâng cấp Deployment lên phiên bản `nginx:1.17`
1. Cập nhật lại file YAML (Cách nhanh nhất là dùng lệnh `sed` để sửa chuỗi `nginx:1.16` thành `nginx:1.17` trong file, hoặc dùng `nano` sửa thủ công):
   ```bash
   sed -i 's/nginx:1.16/nginx:1.17/g' /tmp/nginx-deploy.yaml
   ```
2. Chạy lệnh `apply` lần 2 để tiến hành nâng cấp cuốn chiếu (Rolling Update):
   ```bash
   kubectl apply -f /tmp/nginx-deploy.yaml
   ```

---

## 🔍 Kiểm tra kết quả (Verification)

### 1. Kiểm tra trạng thái nâng cấp (Rollout Status):
```bash
kubectl rollout status deployment/nginx-deploy
```
*Kết quả:* Phải báo `deployment "nginx-deploy" successfully rolled out`.

### 2. Kiểm tra phiên bản Image đang chạy:
```bash
kubectl describe deployment nginx-deploy | grep -i image
```
*Kết quả mong muốn:*
```text
Image:        nginx:1.17
```
Nếu hiển thị đúng `nginx:1.17`, em đã hoàn thành chính xác câu này!
