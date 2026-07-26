# Lời giải Mock Exam 3 - Câu 4: Cấu hình ConfigMap và gắn vào Deployment (8 điểm)

Bài tập này kiểm tra kỹ năng quản lý cấu hình ứng dụng (Application Lifecycle Management), cụ thể là tạo một `ConfigMap` chứa các biến môi trường và liên kết chúng vào một Deployment đang chạy trong cụm.

---

## 🛠️ Quy trình thực hiện (Step-by-step)

### Bước 1: Tạo Namespace `cm-namespace` (nếu chưa có)
```bash
kubectl create namespace cm-namespace
```

### Bước 2: Tạo ConfigMap `app-config`
Dùng lệnh gõ nhanh (imperative) để khởi tạo ConfigMap chứa 2 cặp key-value yêu cầu:
```bash
kubectl create configmap app-config \
  -n cm-namespace \
  --from-literal=ENV=production \
  --from-literal=LOG_LEVEL=info
```

---

### Bước 3: Chỉnh sửa Deployment `cm-webapp` để liên kết ConfigMap
Ta sẽ sửa trực tiếp cấu hình Deployment bằng lệnh `edit`:
```bash
kubectl edit deployment cm-webapp -n cm-namespace
```

Tìm đến khối `spec.template.spec.containers` (container chính của webapp) và tìm trường `env:`. Sửa hoặc bổ sung thêm 2 biến môi trường lấy giá trị từ ConfigMap:

```yaml
spec:
  containers:
  - name: webapp # Hoặc tên container chính đang hiển thị trong file
    image: ...
    env:
    - name: ENV
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: ENV
    - name: LOG_LEVEL
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: LOG_LEVEL
```

*(Nhấn `Esc` -> gõ `:wq` -> `Enter` để lưu và thoát).*

---

## 🔍 Kiểm tra kết quả (Verification)

### 1. Kiểm tra cấu hình của Deployment:
```bash
kubectl get deployment cm-webapp -n cm-namespace -o yaml | grep -A 10 env
```
*Đảm bảo các khối `configMapKeyRef` cho `ENV` và `LOG_LEVEL` đã được cấu hình chính xác.*

### 2. Kiểm tra xem Pod mới có nhận đúng biến môi trường không:
1. Lấy tên Pod đang chạy:
   ```bash
   kubectl get pods -n cm-namespace
   ```
2. Chạy lệnh in biến môi trường trong Pod đó:
   ```bash
   kubectl exec -n cm-namespace <tên-pod> -- env | grep -E "ENV|LOG_LEVEL"
   ```
   *Kết quả mong muốn:*
   ```text
   ENV=production
   LOG_LEVEL=info
   ```
