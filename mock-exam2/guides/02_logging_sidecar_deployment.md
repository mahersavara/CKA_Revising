# Lời giải Mock Exam 2 - Câu 2: Deploy Sidecar Logging Container (10 điểm)

Bài tập này yêu cầu triển khai mô hình **Sidecar Container** nhưng áp dụng dưới dạng **Deployment** trong một namespace riêng biệt.

---

## 🛠️ Quy trình thực hiện (Dùng YAML)

### Bước 1: Tạo Namespace `logging-ns` (nếu chưa có)
```bash
kubectl create namespace logging-ns
```

### Bước 2: Tạo file cấu hình Deployment
Vì Deployment có nhiều container và cấu hình volume phức tạp, ta sẽ dùng lệnh `kubectl create deployment` để sinh khung mẫu trước, sau đó chỉnh sửa:

1. Sinh file YAML mẫu:
   ```bash
   kubectl create deployment logging-deployment \
     --image=busybox \
     -n logging-ns \
     --replicas=1 \
     --dry-run=client -o yaml > /tmp/logging-deploy.yaml
   ```
2. Mở file `/tmp/logging-deploy.yaml` để chỉnh sửa:
   ```bash
   nano /tmp/logging-deploy.yaml
   ```

3. Hoàn thiện nội dung giống hệt như sau:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: logging-deployment
  namespace: logging-ns
spec:
  replicas: 1
  selector:
    matchLabels:
      app: logging-pod
  template:
    metadata:
      labels:
        app: logging-pod
    spec:
      # --- PHẦN 1: KHAI BÁO Ổ ĐĨA DÙNG CHUNG ---
      volumes:
      - name: log-volume
        emptyDir: {}

      initContainers:
      # CONTAINER SIDECAR (log-agent - K8s Native Sidecar)
      - name: log-agent
        image: busybox
        command: ["sh", "-c", "touch /var/log/app/app.log; tail -f /var/log/app/app.log"]
        volumeMounts:
        - name: log-volume
          mountPath: /var/log/app
        restartPolicy: Always  # 👈 Bắt buộc để biến Init Container thành Native Sidecar

      containers:
      # CONTAINER CHÍNH (app-container)
      - name: app-container
        image: busybox
        command: ["sh", "-c", "while true; do echo 'Log entry' >> /var/log/app/app.log; sleep 5; done"]
        volumeMounts:
        - name: log-volume
          mountPath: /var/log/app
```

### Bước 3: Áp dụng cấu hình
```bash
kubectl apply -f /tmp/logging-deploy.yaml
```

---

## 🔍 Kiểm tra kết quả (Verification)

### 1. Kiểm tra trạng thái Pod:
```bash
kubectl get pods -n logging-ns
```
*Kết quả:* Pod của deployment phải hiển thị trạng thái `Running` và có cột `READY` là **`2/2`** (chạy cả 2 container).

### 2. Kiểm tra log của Sidecar container (`log-agent`):
Lấy tên Pod vừa hiển thị ở trên (ví dụ: `logging-deployment-xxxx-xxxx`):
```bash
kubectl logs -n logging-ns <tên-pod> -c log-agent
```
*Kết quả phải in ra liên tục các dòng log:*
```text
Log entry
Log entry
Log entry
```
Nếu log in ra đầy đủ, em đã hoàn thành chính xác câu này!
