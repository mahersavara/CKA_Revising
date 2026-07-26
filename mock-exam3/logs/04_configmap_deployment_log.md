# Nhật ký Thực hành Mock Exam 3 - Câu 4: Cấu hình ConfigMap và gắn vào Deployment

Tài liệu này lưu trữ quá trình khởi tạo ConfigMap `app-config` và liên kết thành công vào Deployment `cm-webapp` trong namespace `cm-namespace`.

---

## 💻 Các lệnh đã thực thi

1. **Tạo ConfigMap:**
   ```bash
   kubectl create configmap app-config -n cm-namespace --from-literal=ENV=production --from-literal=LOG_LEVEL=info
   ```
   *Output:* `configmap/app-config created`

2. **Chỉnh sửa cấu hình Deployment:**
   ```bash
   kubectl edit deployment cm-webapp -n cm-namespace
   ```
   *Cấu hình đã bổ sung trong `spec.template.spec.containers[0].env`:*
   ```yaml
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
   *Output:* `deployment.apps/cm-webapp edited`

3. **Xác nhận cấu hình và biến môi trường:**
   ```bash
   kubectl get pods -n cm-namespace
   # Chạy in biến môi trường từ Pod mới
   kubectl exec -n cm-namespace <tên-pod> -- env | grep -E "ENV|LOG_LEVEL"
   ```
   *Output thực tế:*
   ```text
   ENV=production
   LOG_LEVEL=info
   ```
   *(Nhận xét: Deployment đã tự động khởi động lại Pod với cấu hình biến môi trường chính xác nạp từ ConfigMap).*
