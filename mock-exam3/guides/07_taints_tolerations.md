# Lời giải Mock Exam 3 - Câu 7: Cấu hình Taints & Tolerations cho Node và Pod (12 điểm)

Bài tập này kiểm tra kỹ năng điều phối lập lịch (Scheduling), cụ thể là sử dụng cơ chế **Taints (Đánh dấu độc hại)** trên Node và **Tolerations (Dung thứ)** trên Pod để kiểm soát luồng triển khai ứng dụng.

---

## 🛠️ Quy trình thực hiện (Step-by-step)

### Bước 1: Gán Taint cho Worker Node `node01`
Sử dụng lệnh `kubectl taint` để đánh dấu Node `node01` với thuộc tính `env_type=production:NoSchedule`:
```bash
kubectl taint nodes node01 env_type=production:NoSchedule
```

---

### Bước 2: Khởi tạo Pod `dev-redis` (không có Toleration)
Pod này không được cấu hình dung thứ, do đó nó sẽ không thể chạy trên `node01` mà sẽ được chuyển sang Node khác (hoặc ở trạng thái `Pending` nếu không có Node nào khác trống):
```bash
kubectl run dev-redis --image=redis:alpine
```

---

### Bước 3: Khởi tạo Pod `prod-redis` có chứa Toleration
Vì Pod này cần dung thứ được vết Taint trên `node01` để được lập lịch chạy tại đây:

1. **Sinh file YAML thô của Pod:**
   ```bash
   kubectl run prod-redis --image=redis:alpine --dry-run=client -o yaml > /tmp/prod-redis.yaml
   ```
2. **Mở file `/tmp/prod-redis.yaml` bằng `nano`:**
   ```bash
   nano /tmp/prod-redis.yaml
   ```
3. **Bổ sung khối `tolerations` vào dưới `spec`:**
   ```yaml
   spec:
     tolerations:
     - key: "env_type"
       operator: "Equal"
       value: "production"
       effect: "NoSchedule"       # 👈 Cấu hình dung thứ khớp hoàn toàn với Taint trên node01
     containers:
     - name: prod-redis
       image: redis:alpine
   ```
   *(Nhấn `Ctrl + O` -> `Enter` để lưu, và `Ctrl + X` để thoát).*

4. **Áp dụng file để tạo Pod:**
   ```bash
   kubectl apply -f /tmp/prod-redis.yaml
   ```

---

## 🔍 Kiểm tra kết quả (Verification)

Kiểm tra danh sách các Pod và xem chúng chạy trên Node nào:
```bash
kubectl get pods -o wide | grep -E "dev-redis|prod-redis"
```

*Kết quả mong muốn:*
* **`dev-redis`:** Không được phép chạy trên `node01` (Cột Node có thể hiển thị `controlplane` hoặc trạng thái `Pending`).
* **`prod-redis`:** Phải ở trạng thái **`Running`** và chạy chính xác trên **`node01`** (Cột Node là `node01`).
