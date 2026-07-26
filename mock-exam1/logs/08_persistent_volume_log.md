# Nhật ký Thực hành Mock Exam 1 - Câu 8: Khởi tạo Persistent Volume

Tài liệu này lưu trữ quá trình khởi tạo PersistentVolume `pv-analytics` thành công sau khi sửa đổi các lỗi xung đột cấu hình.

---

## 💻 Các lệnh đã thực thi

1. **Khởi tạo file cấu hình `/tmp/pv.yaml`:**
   * Lần 1: Có sự xung đột giữa `hostPath` và `nfs` (K8s không cho phép khai báo nhiều nguồn đĩa trong 1 PV) cùng lỗi định dạng `hostPath`.
   * Lần 2: Sửa file YAML chuẩn chỉ có `hostPath` và căn lề thụt dòng chính xác:
     ```yaml
     apiVersion: v1
     kind: PersistentVolume
     metadata:
       name: pv-analytics
     spec:
       capacity:
         storage: 100Mi
       volumeMode: Filesystem
       accessModes:
         - ReadWriteMany
       hostPath: 
         path: /pv/data-analytics
     ```

2. **Apply cấu hình:**
   ```bash
   k apply -f pv.yaml
   ```
   *Output:* `persistentvolume/pv-analytics created`

3. **Kiểm tra thông tin chi tiết PV:**
   ```bash
   k describe pv pv-analytics
   ```
   *Output thực tế:*
   ```text
   Name:            pv-analytics
   Status:          Available
   Reclaim Policy:  Retain
   Access Modes:    RWX
   VolumeMode:      Filesystem
   Capacity:        100Mi
   Source:
       Type:          HostPath (bare host directory volume)
       Path:          /pv/data-analytics
   ```
   *(Nhận xét: PV đã chuyển sang trạng thái Available sẵn sàng cho các yêu cầu PVC dùng chung).*
