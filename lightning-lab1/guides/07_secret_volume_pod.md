# Lời giải: Tạo Pod mount Secret Volume dưới dạng Read-Only (20 điểm)

Bài tập này kiểm tra kỹ năng cấu hình bảo mật thông tin (Secret Management) bằng cách mount một Secret có sẵn vào Pod dưới dạng ổ đĩa chỉ đọc (Read-Only Volume).

---

## 🛠️ Quy trình thực hiện nhanh nhất (Imperative + Declarative)

Trong phòng thi, cách nhanh nhất là dùng `dry-run` để sinh ra file YAML khung, sau đó bổ sung phần `volumes` và `volumeMounts`.

### Bước 1: Tạo file YAML khung bằng lệnh `kubectl run`
Chạy lệnh sau để tạo file `/tmp/secret-pod.yaml`:
```bash
kubectl run secret-1401 \
  --image=busybox \
  -n admin1401 \
  --dry-run=client \
  -o yaml -- sleep 4800 > /tmp/secret-pod.yaml
```

### Bước 2: Chỉnh sửa file `/tmp/secret-pod.yaml`
Mở file bằng `nano /tmp/secret-pod.yaml`:
```bash
nano /tmp/secret-pod.yaml
```

Chỉnh sửa và hoàn thiện nội dung giống hệt như sau:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secret-1401
  namespace: admin1401
spec:
  containers:
  - name: secret-admin          # Sửa tên container từ secret-1401 thành secret-admin
    image: busybox
    command: ["sleep", "4800"]  # Lệnh chạy sleep 4800 giây
    volumeMounts:
    - name: secret-volume       # Tên VolumeMount phải trùng với volumes bên dưới
      mountPath: /etc/secret-volume
      readOnly: true            # Bắt buộc phải là True (chỉ đọc)
  volumes:
  - name: secret-volume
    secret:
      secretName: dotfile-secret # Tên Secret đã được tạo sẵn
```

*Lưu ý:* Hãy nhớ đổi tên container từ mặc định (`secret-1401`) thành **`secret-admin`** như đề bài yêu cầu.

### Bước 3: Áp dụng cấu hình và chạy Pod
```bash
kubectl apply -f /tmp/secret-pod.yaml
```

---

## 🔍 Kiểm tra kết quả (Verification)

1. **Kiểm tra trạng thái Pod:**
   ```bash
   kubectl get pods -n admin1401
   ```
   *Kết quả phải hiển thị `secret-1401` đang ở trạng thái `Running`.*

2. **Kiểm tra việc Mount Secret bên trong container:**
   Thực thi lệnh shell vào pod để xem file secret đã được mount đúng chưa:
   ```bash
   kubectl exec -n admin1401 secret-1401 -- ls /etc/secret-volume
   ```
   *Nó phải hiển thị các key có trong `dotfile-secret`.*

3. **Kiểm tra quyền Read-Only:**
   Thử ghi đè một file trong thư mục mount xem có bị báo lỗi chỉ đọc không:
   ```bash
   kubectl exec -n admin1401 secret-1401 -- touch /etc/secret-volume/testfile
   ```
   *Kết quả mong muốn: `touch: /etc/secret-volume/testfile: Read-only file system`.*
