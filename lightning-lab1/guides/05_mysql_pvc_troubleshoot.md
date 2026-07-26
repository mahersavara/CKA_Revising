# Hướng dẫn chi tiết: Troubleshoot Deployment `alpha-mysql` & Storage (20 điểm)

Bài thi CKA thường có câu hỏi trị giá 20 điểm xoay quanh việc xử lý sự cố kết nối giữa Pod, PersistentVolumeClaim (PVC) và PersistentVolume (PV). Dưới đây là các bước phân tích và sửa lỗi chuẩn xác nhất.

---

## 🔍 Quy trình phân tích sự cố (Step-by-step)

### Bước 1: Kiểm tra trạng thái Pod của `alpha-mysql`
Chạy lệnh kiểm tra pod trong namespace `alpha`:
```bash
kubectl get pods -n alpha
```
*Ghi nhận trạng thái:* Pod có thể ở trạng thái `Pending`, `CrashLoopBackOff` hoặc `ContainerCreating`.

### Bước 2: Xem chi tiết lỗi (Describe Pod)
```bash
kubectl describe pod <tên-pod-alpha-mysql> -n alpha
```
Hãy kéo xuống cuối xem phần **`Events`**:
* **Trường hợp 1: Lỗi gắn ổ đĩa (Volume Mount)**
  Nếu thấy lỗi kiểu `waiting for a volume to be created/bound` hoặc `MountVolume.SetUp failed for volume...`:
  -> Nghĩa là đang lỗi ở phần PersistentVolumeClaim (PVC).
* **Trường hợp 2: Lỗi khởi động ứng dụng (CrashLoopBackOff)**
  Nếu pod ở trạng thái `CrashLoopBackOff`, hãy xem log của container:
  ```bash
  kubectl logs -n alpha deployment/alpha-mysql
  ```
  *Lỗi thường thấy của MySQL:* `error: database is uninitialized and password option is not specified`.
  -> Nghĩa là thiếu biến môi trường cấu hình mật khẩu (MYSQL_ROOT_PASSWORD hoặc MYSQL_ALLOW_EMPTY_PASSWORD).

---

## 🛠️ Các lỗi phổ biến và cách khắc phục:

### Lỗi phát hiện thực tế từ cụm:
1. **Lệch cấu hình PVC & PV:** 
   - PV `alpha-pv` có StorageClass là **`slow`**.
   - PVC `alpha-claim` lại có StorageClass là **`slow-storage`**. Do đó PVC bị kẹt ở trạng thái `Pending` (không bind được vào PV).
2. **Sai tên PVC trong Deployment:**
   - Deployment `alpha-mysql` yêu cầu PVC tên là `mysql-alpha-pvc` (nhưng hệ thống chỉ có `alpha-claim`).

### 🛠️ Các bước xử lý cụ thể:

#### Bước 1: Sửa và tạo lại PVC `alpha-claim` để bind vào PV
Vì không thể sửa trực tiếp StorageClass của một PVC đang chạy, ta cần xuất file YAML, sửa rồi tạo lại:

1. Xuất cấu hình của `alpha-claim`:
   ```bash
   kubectl get pvc alpha-claim -n alpha -o yaml > /tmp/alpha-claim.yaml
   ```
2. Xóa PVC cũ bị lỗi:
   ```bash
   kubectl delete pvc alpha-claim -n alpha
   ```
3. Chỉnh sửa file `/tmp/alpha-claim.yaml` bằng `nano`:
   ```bash
   nano /tmp/alpha-claim.yaml
   ```
   *Tìm dòng `storageClassName: slow-storage` và sửa thành `storageClassName: slow`.*
   *Đồng thời, đảm bảo dung lượng request là `1Gi` (hoặc nhỏ hơn) để khớp với dung lượng của PV.*
4. Tạo lại PVC mới:
   ```bash
   kubectl apply -f /tmp/alpha-claim.yaml
   ```
5. Kiểm tra trạng thái PVC:
   ```bash
   kubectl get pvc -n alpha
   ```
   *(Trạng thái bây giờ phải chuyển sang **`Bound`** với volume là `alpha-pv`)*.

#### Bước 2: Sửa Deployment để dùng đúng PVC `alpha-claim`
1. Mở Deployment để chỉnh sửa trực tiếp:
   ```bash
   kubectl edit deployment alpha-mysql -n alpha
   ```
2. Tìm đến phần `volumes` ở cuối file, tìm trường `claimName: mysql-alpha-pvc` và sửa thành:
   ```yaml
         persistentVolumeClaim:
           claimName: alpha-claim
   ```
3. Lưu và đóng trình soạn thảo. Deployment sẽ tự động restart Pod và mount ổ đĩa mới thành công.

### Lỗi 2: Sai cấu hình trong Deployment (`alpha-mysql`)
Hãy xuất file YAML của deployment hiện tại ra để chỉnh sửa:
```bash
kubectl get deployment alpha-mysql -n alpha -o yaml > /tmp/alpha-mysql.yaml
```

Mở file `/tmp/alpha-mysql.yaml` và kiểm tra các phần sau:

1. **Kiểm tra phần biến môi trường (`env`):**
   Phải có biến `MYSQL_ALLOW_EMPTY_PASSWORD=1`:
   ```yaml
   spec:
     containers:
     - name: mysql  # Hoặc tên container của mysql
       env:
       - name: MYSQL_ALLOW_EMPTY_PASSWORD
         value: "1"
   ```

2. **Kiểm tra phần gắn ổ đĩa (`volumeMounts` và `volumes`):**
   * Trong container:
     ```yaml
     volumeMounts:
     - name: mysql-volume  # Tên volume phải trùng với khai báo bên dưới
       mountPath: /var/lib/mysql
     ```
   * Trong spec của Pod:
     ```yaml
     volumes:
     - name: mysql-volume
       persistentVolumeClaim:
         claimName: alpha-pvc # Tên PVC đúng trong namespace alpha
     ```

### Bước 3: Áp dụng cấu hình mới
Sau khi sửa đổi file `/tmp/alpha-mysql.yaml`, hãy áp dụng lại:
```bash
kubectl replace -f /tmp/alpha-mysql.yaml --force
```

---

## ✅ Xác nhận hoàn thành
1. Chạy `kubectl get pvc -n alpha` -> Trạng thái phải là `Bound`.
2. Chạy `kubectl get pods -n alpha` -> Trạng thái Pod phải là `Running` và `READY 1/1`.
