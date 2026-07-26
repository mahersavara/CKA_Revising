# Lời giải Mock Exam 1 - Câu 7: Tạo NodePort Service với Cổng Chỉ Định (8 điểm)

Bài tập này kiểm tra kỹ năng cấu hình dịch vụ mạng (Services & Networking), yêu cầu tạo một Service loại `NodePort` có cổng dịch vụ (`port`), cổng container (`targetPort`), và cổng trên các Node vật lý (`nodePort`) được chỉ định cụ thể.

---

## ⚠️ Cảnh báo lỗi hay gặp khi tự làm:
Khi dùng lệnh `kubectl expose deployment hr-web-app --name=hr-web-app-service --port=30082`:
1. **Sai Type:** Mặc định lệnh `expose` tạo ra dịch vụ `ClusterIP`, trong khi đề yêu cầu `NodePort`.
2. **Sai Port & TargetPort:** Ứng dụng web thực tế lắng nghe ở cổng `8080`, do đó `port` và `targetPort` phải là `8080`. Cổng `30082` là cổng truy cập ngoài Node (`nodePort`).
3. **Thiếu NodePort:** Lệnh `expose` không có cờ `--node-port`. Ta bắt buộc phải sửa file YAML hoặc chạy lệnh edit.

---

## 🛠️ Quy trình thực hiện chuẩn xác (Dùng YAML Tạm)

Để giải quyết bài này nhanh nhất mà không lo sai nhãn `selector`:

### Bước 1: Xóa Service cũ bị lỗi (nếu em vừa tạo)
```bash
kubectl delete svc hr-web-app-service
```

### Bước 2: Sinh file YAML cấu hình thô
Dùng `expose` kết hợp `dry-run` để tự động ánh xạ đúng selector của Deployment:
```bash
kubectl expose deployment hr-web-app \
  --name=hr-web-app-service \
  --type=NodePort \
  --port=8080 \
  --target-port=8080 \
  --dry-run=client -o yaml > /tmp/svc.yaml
```

### Bước 3: Thêm `nodePort` vào file cấu hình
Mở file `/tmp/svc.yaml` lên:
```bash
nano /tmp/svc.yaml
```

Tìm đến phần `ports:` và bổ sung dòng `nodePort: 30082` vào bên trong:
```yaml
spec:
  ports:
  - port: 8080
    protocol: TCP
    targetPort: 8080
    nodePort: 30082  # 👈 Thêm dòng này vào đây
  selector:
    app: hr-web-app
  type: NodePort
```
*(Nhấn `Ctrl + O` -> `Enter` để lưu, và `Ctrl + X` để thoát).*

### Bước 4: Tạo Service từ file đã sửa
```bash
kubectl apply -f /tmp/svc.yaml
```

---

## 🔍 Kiểm tra kết quả (Verification)

### 1. Kiểm tra lướt qua trạng thái Service:
```bash
kubectl get svc hr-web-app-service
```
*Kết quả đúng:*
```text
NAME                 TYPE       CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
hr-web-app-service   NodePort   172.20.141.187  <none>        8080:30082/TCP   5s
```
*(Hãy chú ý cột PORT(S) hiển thị ánh xạ `8080:30082/TCP`)*.

### 2. Mô tả chi tiết Service để xác nhận Endpoints:
```bash
kubectl describe svc hr-web-app-service
```
*Yêu cầu:*
- Cột `Endpoints` phải hiển thị đủ **2 IP** tương ứng với 2 Pod của Deployment `hr-web-app`.
- `NodePort` hiển thị đúng `30082`.
