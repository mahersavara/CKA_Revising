# Lời giải Mock Exam 1 - Câu 8: Khởi tạo Persistent Volume (8 điểm)

Bài tập này kiểm tra kỹ năng quản lý tài nguyên lưu trữ (Storage) trong Kubernetes, cụ thể là tạo một PersistentVolume (PV) kiểu `hostPath` (sử dụng thư mục trực tiếp trên Node để lưu trữ dữ liệu).

---

## 🛠️ Quy trình thực hiện (Dùng YAML)

Vì `kubectl` không hỗ trợ lệnh tạo nhanh (imperative command) cho PersistentVolume, ta bắt buộc phải viết file YAML.

### Bước 1: Tạo file cấu hình YAML cho PV
Em hãy tạo file `/tmp/pv.yaml` bằng cách chạy lệnh sau:

```bash
cat <<EOF > /tmp/pv.yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-analytics      # Tên của PersistentVolume
spec:
  capacity:
    storage: 100Mi        # Dung lượng ổ đĩa
  accessModes:
    - ReadWriteMany       # Chế độ truy cập (nhiều Node cùng đọc-ghi)
  hostPath:
    path: /pv/data-analytics # Đường dẫn thư mục trên Node vật lý
EOF
```

### Bước 2: Khởi tạo PersistentVolume trong cụm
```bash
kubectl apply -f /tmp/pv.yaml
```

---

## 🔍 Kiểm tra kết quả (Verification)

Chạy lệnh kiểm tra trạng thái PV vừa tạo:
```bash
kubectl get pv pv-analytics
```

*Kết quả mong muốn:*
```text
NAME           CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS      CLAIM   STORAGECLASS   REASON   AGE
pv-analytics   100Mi      RWX            Retain           Available                                   5s
```
*Yêu cầu kiểm tra:*
* **STATUS:** Phải là **`Available`** (đã sẵn sàng để PVC bind).
* **CAPACITY:** Đúng **`100Mi`**.
* **ACCESS MODES:** Đúng **`RWX`** (viết tắt của `ReadWriteMany`).

---

## 💡 Cách tìm Template trên trang tài liệu `kubernetes.io/docs`

Khi thi, để tìm nhanh cấu trúc mẫu của Persistent Volume:
1. Gõ từ khóa tìm kiếm: **`persistent volume hostpath`** hoặc **`pv hostpath`**.
2. Click vào bài viết: **"Configure a Pod to Use a PersistentVolume for Storage"** (đây là bài viết có mẫu YAML sạch nhất).
3. Copy khối YAML ở ngay đầu bài viết (thường tên là `pv-volume`):
   ```yaml
   apiVersion: v1
   kind: PersistentVolume
   metadata:
     name: pv-volume
     labels:
       type: local
   spec:
     storageClassName: manual
     capacity:
       storage: 10Gi
     accessModes:
       - ReadWriteOnce
     hostPath:
       path: "/mnt/data"
   ```
4. Dán vào terminal/editor và sửa đổi:
   - Sửa `name` thành `pv-analytics`.
   - Sửa `storage` thành `100Mi`.
   - Sửa `accessModes` thành `ReadWriteMany`.
   - Sửa `hostPath.path` thành `/pv/data-analytics`.
   - Bỏ các phần không cần thiết như `labels` hay `storageClassName` (nếu đề bài không yêu cầu).

