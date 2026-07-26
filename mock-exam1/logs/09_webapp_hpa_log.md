# Nhật ký Thực hành Mock Exam 1 - Câu 9: Cấu hình Horizontal Pod Autoscaler

Tài liệu này lưu trữ quá trình khởi tạo và kiểm tra HPA `webapp-hpa` thành công trên cụm.

---

## 💻 Các lệnh đã thực thi

1. **Khởi tạo HPA tự động bằng cờ dry-run:**
   ```bash
   kubectl autoscale deployment kkapp-deploy \
     --name=webapp-hpa \
     --cpu-percent=50 \
     --min=1 \
     --max=10 \
     --dry-run=client -o yaml > /root/webapp-hpa.yaml
   ```

2. **Chèn thêm cấu hình `behavior` vào `/root/webapp-hpa.yaml`:**
   ```yaml
     behavior:
       scaleDown:
         stabilizationWindowSeconds: 300
   ```

3. **Apply cấu hình tạo HPA:**
   ```bash
   k apply -f /root/webapp-hpa.yaml
   ```
   *Output:* `horizontalpodautoscaler.autoscaling/webapp-hpa created`

4. **Kiểm tra mô tả chi tiết của HPA:**
   ```bash
   k describe hpa webapp-hpa 
   ```
   *Output thực tế:*
   ```text
   Name:                                                  webapp-hpa
   Reference:                                             Deployment/kkapp-deploy
   Metrics:                                               ( current / target )
     resource cpu on pods  (as a percentage of request):  <unknown> / 50%
   Min replicas:                                          1
   Max replicas:                                          10
   Behavior:
     Scale Down:
       Stabilization Window: 300 seconds
   ```
   *(Nhận xét: HPA đã được tạo chính xác. Cảnh báo lỗi `FailedGetResourceMetric` là bình thường trong môi trường thi thử do Metrics Server cần thời gian thu thập dữ liệu hoặc Pod chưa cấu hình trường resource.requests.cpu).*
