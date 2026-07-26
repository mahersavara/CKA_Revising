# Nhật ký Thực hành: Sửa lỗi Storage & Deployment `alpha-mysql`

Tài liệu này lưu trữ toàn bộ quá trình thực hành gõ lệnh và output thực tế khi sửa lỗi kết nối PV/PVC cho Deployment `alpha-mysql` trên KodeKloud.

---

## 🔍 Bước 1: Phát hiện lỗi
1. Kiểm tra trạng thái Pod:
   ```bash
   k get pods -n alpha
   ```
   *Output: Pod `alpha-mysql-...` ở trạng thái `Pending`.*

2. Mô tả chi tiết Pod để xem sự kiện lỗi:
   ```bash
   k describe pod -n alpha alpha-mysql-...
   ```
   *Output Event:*
   ```text
   Warning  FailedScheduling  ...  default-scheduler  0/2 nodes are available: persistentvolumeclaim "mysql-alpha-pvc" not found. not found
   ```
   => **Lỗi 1:** Deployment yêu cầu PVC tên là `mysql-alpha-pvc` nhưng trong namespace không có.

3. Kiểm tra các PVC và PV hiện có:
   ```bash
   k get pvc -n alpha
   k get pv alpha-pv
   ```
   *Output:*
   - PVC `alpha-claim` có trạng thái `Pending` và StorageClass là `slow` (đã được sửa thử từ `slow-storage`).
   - PV `alpha-pv` có trạng thái `Available`, dung lượng `1Gi`, AccessMode `RWO`, StorageClass `slow`.

4. Xem chi tiết cấu hình file `/tmp/alpha-claim.yaml` ban đầu:
   - `accessModes: ReadWriteMany` (PV chỉ hỗ trợ `ReadWriteOnce`).
   - `storage: 2Gi` (PV chỉ có `1Gi`).
   - `storageClassName: slow-storage` (PV có `slow`).
   => **Lỗi 2:** Lệch cả 3 thông số AccessMode, Dung lượng và StorageClass giữa PVC và PV khiến PVC không thể bind.

---

## 🛠️ Bước 2: Khắc phục lỗi

1. Xóa PVC cũ bị sai cấu hình:
   ```bash
   k delete pvc alpha-claim -n alpha
   ```

2. Tạo lại file cấu hình tối giản `/tmp/alpha-claim.yaml` với thông số chính xác:
   ```yaml
   apiVersion: v1
   kind: PersistentVolumeClaim
   metadata:
     name: alpha-claim
     namespace: alpha
   spec:
     accessModes:
       - ReadWriteOnce
     resources:
       requests:
         storage: 1Gi
     storageClassName: slow
   ```

3. Áp dụng cấu hình PVC mới:
   ```bash
   k apply -f /tmp/alpha-claim.yaml
   ```
   *Lúc này PVC vẫn ở trạng thái `Pending` kèm sự kiện: `waiting for first consumer to be created before binding` vì cơ chế `WaitForFirstConsumer` của StorageClass `slow`.*

4. Sửa Deployment để trỏ sang đúng tên PVC `alpha-claim`:
   ```bash
   k edit deployment -n alpha alpha-mysql
   ```
   *Sửa phần `volumes` ở cuối file:*
   ```yaml
         volumes:
         - name: mysql-data
           persistentVolumeClaim:
             claimName: alpha-claim
   ```

---

## ✅ Bước 3: Xác nhận thành công
1. Kiểm tra lại trạng thái PVC:
   ```bash
   k get pvc -n alpha
   ```
   *Output: `alpha-claim` chuyển sang trạng thái **`Bound`** với volume là `alpha-pv`.*

2. Kiểm tra lại trạng thái Pod:
   ```bash
   k get pods -n alpha
   ```
   *Output: Pod chuyển sang trạng thái **`Running`** (READY `1/1`)*.
