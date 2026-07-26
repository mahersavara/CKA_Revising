# Nhật ký Thực hành Mock Exam 3 - Câu 11: Cấu hình HPA với Custom Metric

Tài liệu này lưu trữ quá trình khởi tạo và kiểm tra HorizontalPodAutoscaler `api-hpa` cấu hình theo Custom Metric `requests_per_second` thành công trong namespace `api`.

---

## 💻 Các lệnh đã thực thi

1. **Khởi tạo file cấu hình `/tmp/api-hpa.yaml`:**
   ```bash
   cat <<EOF > /tmp/api-hpa.yaml
   apiVersion: autoscaling/v2
   kind: HorizontalPodAutoscaler
   metadata:
     name: api-hpa
     namespace: api
   spec:
     scaleTargetRef:
       apiVersion: apps/v1
       kind: Deployment
       name: api-deployment
     minReplicas: 1
     maxReplicas: 20
     metrics:
     - type: Pods
       pods:
         metric:
           name: requests_per_second
         target:
           type: AverageValue
           averageValue: 1000
   EOF
   ```

2. **Apply cấu hình:**
   ```bash
   kubectl apply -f /tmp/api-hpa.yaml
   ```
   *Output:* `horizontalpodautoscaler.autoscaling/api-hpa created`

3. **Xác nhận kết quả:**
   ```bash
   kubectl describe hpa api-hpa -n api
   ```
   *Output thực tế mong muốn:*
   ```text
   Name:                                   api-hpa
   Namespace:                              api
   Reference:                              Deployment/api-deployment
   Metrics:                                ( current / target )
     "requests_per_second" on pods:        <unknown> / 1000
   Min replicas:                           1
   Max replicas:                           20
   ```
   *(Nhận xét: HPA đã được tạo thành công với chỉ số Custom Metric requests_per_second mục tiêu là 1000).*
