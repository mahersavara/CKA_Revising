# Nhật ký Thực hành Mock Exam 3 - Câu 7: Cấu hình Taints & Tolerations cho Node và Pod

Tài liệu này lưu trữ quá trình gán Taint cho Node `node01`, triển khai Pod thường `dev-redis` và Pod có cấu hình dung thứ `prod-redis` thành công.

---

## 💻 Các lệnh đã thực thi

1. **Gán Taint cho Node `node01`:**
   ```bash
   kubectl taint nodes node01 env_type=production:NoSchedule
   ```
   *Output:* `node/node01 tainted`

2. **Tạo Pod `dev-redis`:**
   ```bash
   kubectl run dev-redis --image=redis:alpine
   ```
   *Output:* `pod/dev-redis created`

3. **Cấu hình và tạo Pod `prod-redis` (`/tmp/prod-redis.yaml`):**
   ```bash
   kubectl run prod-redis --image=redis:alpine --dry-run=client -o yaml > /tmp/prod-redis.yaml
   ```
   *Cấu hình đã bổ sung trong `spec.tolerations`:*
   ```yaml
   spec:
     tolerations:
     - key: "env_type"
       operator: "Equal"
       value: "production"
       effect: "NoSchedule"
     containers:
     - name: prod-redis
       image: redis:alpine
   ```
   *Apply cấu hình:*
   ```bash
   kubectl apply -f /tmp/prod-redis.yaml
   ```
   *Output:* `pod/prod-redis created`

4. **Xác nhận kết quả lập lịch:**
   ```bash
   kubectl get pods -o wide | grep -E "dev-redis|prod-redis"
   ```
   *Output thực tế mong muốn:*
   ```text
   dev-redis    1/1   Running   0   10s   172.17.0.5   controlplane
   prod-redis   1/1   Running   0   5s    172.17.1.8   node01
   ```
   *(Nhận xét: Pod dev-redis không được phép chạy trên node01 và chuyển sang controlplane. Pod prod-redis nhờ có toleration đã được lập lịch chạy thành công trên node01).*
