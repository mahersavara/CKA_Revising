# Nhật ký Thực hành Mock Exam 3 - Câu 8: Troubleshoot PVC/PV Binding

Tài liệu này lưu trữ quá trình chẩn đoán sự cố mâu thuẫn cấu hình giữa PVC `app-pvc` và PV `app-pv`, và khắc phục thành công để PVC chuyển sang trạng thái Bound.

---

## 💻 Các lệnh đã thực thi

1. **Xem cấu hình PV và PVC ban đầu:**
   ```bash
   kubectl get pv app-pv -o yaml
   kubectl get pvc app-pvc -n storage-ns -o yaml
   ```

2. **Khắc phục sự cố (Xuất cấu hình sửa đổi):**
   ```bash
   kubectl get pvc app-pvc -n storage-ns -o yaml > /tmp/app-pvc.yaml
   ```
   *(Sửa đổi các thông số mâu thuẫn trong file /tmp/app-pvc.yaml để khớp với PV, đồng thời dọn dẹp các trường metadata tự sinh).*

3. **Xóa PVC cũ và tạo lại PVC mới:**
   ```bash
   kubectl delete pvc app-pvc -n storage-ns
   kubectl apply -f /tmp/app-pvc.yaml
   ```

4. **Xác nhận kết quả:**
   ```bash
   kubectl get pvc app-pvc -n storage-ns
   ```
   *Output thực tế mong muốn:*
   ```text
   NAME      STATUS   VOLUME   CAPACITY   ACCESS MODES   STORAGECLASS   AGE
   app-pvc   Bound    app-pv   ...        ...            ...            5s
   ```
   *(Nhận xét: PVC đã được liên kết thành công với PV app-pv sau khi sửa đổi thông số khớp cấu hình).*
