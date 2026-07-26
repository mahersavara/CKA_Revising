# Lời giải Mock Exam 3 - Câu 11: Cấu hình HPA với Custom Metric (6 điểm)

Bài tập này kiểm tra kỹ năng cấu hình tự động co giãn Pod (Autoscaling) nâng cao dựa trên **Custom Metric (Chỉ số tự định nghĩa)** thay vì các chỉ số tài nguyên hệ thống cơ bản như CPU hay Memory.

---

## 🛠️ Quy trình thực hiện (Dùng YAML)

Vì `kubectl autoscale` không hỗ trợ chỉ số Custom Metric, ta bắt buộc phải viết bằng file YAML cấu hình.

### Bước 1: Tạo file cấu hình `api-hpa.yaml`
Em chạy khối lệnh tạo file `/tmp/api-hpa.yaml` trên terminal:

```bash
cat <<EOF > /tmp/api-hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
  namespace: api                    # 👈 Chạy trong đúng namespace api
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-deployment
  minReplicas: 1
  maxReplicas: 20
  metrics:
  - type: Pods                      # 👈 Loại chỉ số là Pods (thu thập từ từng Pod)
    pods:
      metric:
        name: requests_per_second   # 👈 Tên Custom Metric
      target:
        type: AverageValue
        averageValue: 1000          # 👈 Giá trị trung bình mục tiêu là 1000 req/s
EOF
```

### Bước 2: Khởi tạo HPA trong cụm
```bash
kubectl apply -f /tmp/api-hpa.yaml
```

---

## 🔍 Kiểm tra kết quả (Verification)

### 1. Kiểm tra trạng thái HPA trong namespace `api`:
```bash
kubectl get hpa api-hpa -n api
```

### 2. Xem chi tiết cấu hình để xác nhận Custom Metric:
```bash
kubectl describe hpa api-hpa -n api
```
*Đảm bảo ở phần Metrics hiển thị:*
`"requests_per_second" on pods: <unknown> / 1000`
*(⚠️ Lưu ý: Theo đề bài, việc hiển thị `<unknown>` do Metric Server chưa thu thập được chỉ số này là hoàn toàn bình thường và được chấp nhận).*
