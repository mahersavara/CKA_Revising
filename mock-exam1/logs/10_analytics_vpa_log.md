# Nhật ký Thực hành Mock Exam 1 - Câu 10: Khởi tạo Vertical Pod Autoscaler

Tài liệu này lưu trữ quá trình khởi tạo VerticalPodAutoscaler `analytics-vpa` thành công trên cụm.

---

## 💻 Các lệnh đã thực thi

1. **Khởi tạo file cấu hình `verticle.yaml`:**
   ```yaml
   apiVersion: autoscaling.k8s.io/v1
   kind: VerticalPodAutoscaler
   metadata:
     name: analytics-vpa
   spec:
     targetRef:
       apiVersion: "apps/v1"
       kind: Deployment
       name: analytics-deployment
     updatePolicy:
       updateMode: "Recreate"
   ```

2. **Apply cấu hình tạo VPA:**
   ```bash
   k apply -f verticle.yaml
   ```
   *Output:* `verticalpodautoscaler.autoscaling.k8s.io/analytics-vpa created`

3. **Kiểm tra trạng thái VPA:**
   ```bash
   k get vpa
   ```
   *Output thực tế:*
   ```text
   NAME            MODE       CPU   MEM   PROVIDED   AGE
   analytics-vpa   Recreate                          5s
   ```
   *(Nhận xét: VPA đã được tạo chính xác và đang hoạt động ở chế độ Recreate để tự động tính toán tài nguyên cho analytics-deployment).*
