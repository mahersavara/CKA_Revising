# Lời giải Mock Exam 3 - Câu 8: Troubleshoot PVC/PV Binding (6 điểm)

Bài tập này kiểm tra kỹ năng chẩn đoán sự cố (Troubleshooting) liên quan đến quản lý ổ đĩa lưu trữ (Storage), cụ thể là tìm nguyên nhân làm cho một PersistentVolumeClaim (PVC) ở trạng thái `Pending` không thể liên kết (`bind`) với PersistentVolume (PV) có sẵn.

---

## 🔍 Quy trình chẩn đoán sự cố (Troubleshooting Workflow)

⚠️ **Lưu ý đặc biệt:** Đề bài yêu cầu: *"Do not modify the PV resource"* (Không được sửa đổi tài nguyên PV). Vì vậy mọi thay đổi sửa lỗi chỉ được thực hiện trên PVC.

### Bước 1: Inspect (Kiểm tra) thông số của PV và PVC hiện tại
Chạy 2 lệnh kiểm tra cấu hình chi tiết dưới dạng YAML:

1. **Xem cấu hình PV `app-pv`:**
   ```bash
   kubectl get pv app-pv -o yaml
   ```
2. **Xem cấu hình PVC `app-pvc` trong namespace `storage-ns`:**
   ```bash
   kubectl get pvc app-pvc -n storage-ns -o yaml
   ```

---

## 💡 Các lỗi mâu thuẫn hay gặp khiến PVC không thể Bind:

1. **Mâu thuẫn Dung lượng (`storage`):** PVC yêu cầu dung lượng lớn hơn dung lượng PV cung cấp (Ví dụ PVC xin `10Gi` nhưng PV chỉ có `5Gi`).
2. **Mâu thuẫn StorageClass (`storageClassName`):** Tên StorageClass khai báo trong PVC bị lệch so với PV (Một bên để `manual`, một bên để `slow` hoặc trống).
3. **Mâu thuẫn Chế độ truy cập (`accessModes`):** PVC yêu cầu chế độ truy cập (ví dụ `ReadWriteMany`) mà PV không hỗ trợ (PV chỉ có `ReadWriteOnce`).
4. **Mâu thuẫn Bộ lọc (`selector`):** PVC dùng nhãn bộ lọc để tìm PV, nhưng PV không có nhãn tương ứng.

---

## 🛠️ Quy trình sửa chữa (Fixing)

Sau khi xác định được trường mâu thuẫn (ví dụ dung lượng yêu cầu trong PVC quá lớn):
1. **Xuất cấu hình PVC ra file tạm:**
   ```bash
   kubectl get pvc app-pvc -n storage-ns -o yaml > /tmp/app-pvc.yaml
   ```
2. **Mở file bằng `nano /tmp/app-pvc.yaml` và sửa lại thông số bị sai lệch cho khớp với PV.**
   * *Đồng thời xóa các trường metadata tự sinh:* `uid`, `resourceVersion`, `creationTimestamp`, và khối `status:` ở cuối file.
3. **Xóa PVC lỗi hiện tại:**
   ```bash
   kubectl delete pvc app-pvc -n storage-ns
   ```
4. **Tạo lại PVC mới từ file đã sửa:**
   ```bash
   kubectl apply -f /tmp/app-pvc.yaml
   ```

---

## 🔍 Kiểm tra kết quả (Verification)
```bash
kubectl get pvc app-pvc -n storage-ns
```
*Kết quả đúng:* Trạng thái chuyển từ `Pending` sang **`Bound`** thành công.
