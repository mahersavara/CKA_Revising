# Lời giải Mock Exam 2 - Câu 8: Cấu hình HPA theo Memory (10 điểm)

Bài tập này kiểm tra kỹ năng cấu hình tự động co giãn Pod (Autoscaling) dựa trên tài nguyên **Memory (Bộ nhớ)** thay vì CPU truyền thống.

---

## 🛠️ Quy trình thực hiện (Dùng YAML & Sửa Lệnh)

⚠️ **Lưu ý quan trọng:** 
* Đề bài yêu cầu lưu file YAML tại đường dẫn `/root/webapp-hpa.yaml` (dù HPA tên là `backend-hpa`). Hãy tạo đúng tên file này để grading script chấm điểm chính xác.
* Lệnh `kubectl autoscale` **không hỗ trợ** cấu hình trực tiếp cho Memory. Do đó ta sẽ dùng cờ CPU để sinh file template trước, rồi sửa thành Memory.

### Bước 1: Sinh file cấu hình mẫu (Template) bằng CPU
Em chạy lệnh sau để tự sinh file `/root/webapp-hpa.yaml`:
```bash
kubectl autoscale deployment backend-deployment \
  --name=backend-hpa \
  --min=3 \
  --max=15 \
  --cpu-percent=65 \
  -n backend \
  --dry-run=client -o yaml > /root/webapp-hpa.yaml
```

### Bước 2: Chỉnh sửa file `/root/webapp-hpa.yaml` sang Memory
1. Mở file lên bằng `nano`:
   ```bash
   nano /root/webapp-hpa.yaml
   ```
2. Tìm đến khối `metrics:` và sửa chữ `cpu` thành **`memory`**.

*File sau khi sửa sẽ giống thế này:*
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
  namespace: backend
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend-deployment
  minReplicas: 3
  maxReplicas: 15
  metrics:
  - type: Resource
    resource:
      name: memory            # 👈 Đổi từ cpu thành memory
      target:
        type: Utilization
        averageUtilization: 65 # Giữ nguyên hoặc sửa thành 65
```
*(Nhấn `Ctrl + O` -> `Enter` để lưu, và `Ctrl + X` để thoát).*

### Bước 3: Áp dụng cấu hình lên cụm
```bash
kubectl apply -f /root/webapp-hpa.yaml
```

---

## 🔍 Kiểm tra kết quả (Verification)

### 1. Kiểm tra trạng thái HPA trong namespace `backend`:
```bash
kubectl get hpa backend-hpa -n backend
```
*Kết quả mong muốn:*
```text
NAME          REFERENCE                     TARGETS         MINPODS   MAXPODS   REPLICAS   AGE
backend-hpa   Deployment/backend-deployment   <unknown>/65%   3         15        3          10s
```

### 2. Xem chi tiết cấu hình để xác nhận Memory:
```bash
kubectl describe hpa backend-hpa -n backend
```
*Đảm bảo ở phần Metrics hiển thị:*
`resource memory on pods (as a percentage of request): <unknown> / 65%`
