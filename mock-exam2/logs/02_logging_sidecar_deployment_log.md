# Nhật ký Thực hành Mock Exam 2 - Câu 2: Deploy Sidecar Logging Container

Tài liệu này lưu trữ quá trình triển khai Deployment `logging-deployment` và kiểm tra hoạt động của Sidecar log container thành công trong namespace `logging-ns`.

---

## 💻 Các lệnh đã thực thi

1. **Khởi tạo file cấu hình `/tmp/logging-deploy.yaml`:**
   ```bash
   cat <<EOF > /tmp/logging-deploy.yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: logging-deployment
     namespace: logging-ns
   spec:
     replicas: 1
     selector:
       matchLabels:
         app: logger
     template:
       metadata:
         labels:
           app: logger
       spec:
         volumes:
         - name: log-volume
           emptyDir: {}
         initContainers:
         - name: log-agent
           image: busybox
           command: ["sh", "-c", "touch /var/log/app/app.log; tail -f /var/log/app/app.log"]
           volumeMounts:
           - name: log-volume
             mountPath: /var/log/app
           restartPolicy: Always
         containers:
         - name: app-container
           image: busybox
           command: ["sh", "-c", "while true; do echo 'Log entry' >> /var/log/app/app.log; sleep 5; done"]
           volumeMounts:
           - name: log-volume
             mountPath: /var/log/app
   EOF
   ```

2. **Apply cấu hình:**
   ```bash
   kubectl apply -f /tmp/logging-deploy.yaml
   ```
   *Output:* `deployment.apps/logging-deployment configured` (hoặc created)

3. **Kiểm tra trạng thái triển khai:**
   ```bash
   kubectl get pods -n logging-ns
   ```
   *Output:*
   ```text
   NAME                                 READY   STATUS    RESTARTS   AGE
   logging-deployment-fd754bd96-42ftl   2/2     Running   0          20s
   ```
   *(Nhận xét: Pod đã ở trạng thái 2/2 Running, chứng tỏ cả container chính và sidecar đều hoạt động tốt).*

4. **Kiểm tra log của Sidecar container (`log-agent`):**
   ```bash
   kubectl logs -n logging-ns deployment/logging-deployment -c log-agent
   ```
   *Output thực tế:*
   ```text
   Log entry
   Log entry
   Log entry
   Log entry
   ```
   *(Nhận xét: Container log-agent đã in thành công dữ liệu log do app-container ghi ra môi trường stdout).*
