# Nhật ký Thực hành Mock Exam 2 - Câu 8: Cấu hình HPA theo Memory

Tài liệu này lưu trữ quá trình khởi tạo và cấu hình HorizontalPodAutoscaler `backend-hpa` dựa trên chỉ số Memory (65%) thành công trong namespace `backend`.

---

## 💻 Các lệnh đã thực thi

1. **Khởi tạo file cấu hình mẫu `/root/webapp-hpa.yaml`:**
   ```bash
   kubectl autoscale deployment backend-deployment \
     --name=backend-hpa \
     --min=3 \
     --max=15 \
     --cpu=65 \
     -n backend \
     --dry-run=client -o yaml > /root/webapp-hpa.yaml
   ```

2. **Chỉnh sửa file cấu hình bằng nano:**
   * Thay đổi trường `name: cpu` thành `name: memory`.

3. **Apply cấu hình:**
   ```bash
   kubectl apply -f /root/webapp-hpa.yaml
   ```
   *Output:* `horizontalpodautoscaler.autoscaling/backend-hpa created`

4. **Kiểm tra trạng thái HPA:**
   ```bash
   kubectl get hpa backend-hpa -n backend
   ```
   *Output thực tế:*
   ```text
   NAME          REFERENCE                       TARGETS                 MINPODS   MAXPODS   REPLICAS   AGE
   backend-hpa   Deployment/backend-deployment   memory: <unknown>/65%   3         15        0          6s
   ```
   *(Nhận xét: HPA đã được cấu hình thành công với chỉ số mục tiêu là memory: 65% và số lượng replica dao động từ 3 đến 15).*
