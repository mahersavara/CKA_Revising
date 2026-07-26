# Nhật ký Thực hành Mock Exam 1 - Câu 7: Tạo NodePort Service cho Deployment `hr-web-app`

Tài liệu này lưu trữ quá trình khởi tạo và sửa lỗi Service NodePort `hr-web-app-service` với cổng chỉ định `30082`.

---

## 💻 Các lệnh đã thực thi

1. **Xóa Service bị cấu hình sai trước đó:**
   ```bash
   k delete svc hr-web-app-service
   ```

2. **Sinh file YAML thô có sẵn selector từ deployment:**
   ```bash
   k expose deployment hr-web-app \
     --name=hr-web-app-service \
     --type=NodePort \
     --port=8080 \
     --target-port=8080 \
     --dry-run=client -o yaml > /tmp/svc.yaml
   ```

3. **Chỉnh sửa file `/tmp/svc.yaml` bằng `nano`:**
   * Bổ sung trường `nodePort: 30082` vào khối `ports`.

4. **Tạo Service mới:**
   ```bash
   k apply -f /tmp/svc.yaml
   ```
   *Output:* `service/hr-web-app-service created`

5. **Xác nhận kết quả:**
   ```bash
   k get svc hr-web-app-service 
   ```
   *Output thực tế:*
   ```text
   NAME                 TYPE       CLUSTER-IP       EXTERNAL-IP   PORT(S)          AGE
   hr-web-app-service   NodePort   172.20.168.136   <none>        8080:30082/TCP   8s
   ```
   *(Nhận xét: Service đã chuyển sang loại NodePort thành công. Cổng dịch vụ lắng nghe ở 8080 và cổng kết nối ngoài là 30082).*
