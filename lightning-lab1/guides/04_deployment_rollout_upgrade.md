# Lời giải: Khởi tạo, Nâng cấp Deployment & Ghi chú (Rollout & Annotations)

Bài tập này kiểm tra kỹ năng quản lý vòng đời ứng dụng (Application Lifecycle Management) trong Kubernetes, cụ thể là cập nhật ứng dụng không gây gián đoạn (Rolling Update) và ghi lại nhật ký thay đổi (Change Cause Annotation).

---

## 🛠️ Quy trình thực hiện nhanh nhất (Imperative Commands)

### Bước 1: Tạo Deployment ban đầu
Sử dụng `kubectl` để tạo nhanh Deployment tên là `nginx-deploy` chạy image `nginx:1.16` với 1 replica:
```bash
kubectl create deployment nginx-deploy --image=nginx:1.16 --replicas=1
```

### Bước 2: Nâng cấp phiên bản Image lên `1.17`
Để nâng cấp phiên bản container mà không cần sửa file YAML, ta dùng lệnh `set image`. 
*Mẹo: Ta cần biết tên container bên trong Pod. Thường container đầu tiên sẽ trùng tên với image hoặc tên deployment. Ta có thể chạy lệnh sau để cập nhật:*
```bash
kubectl set image deployment/nginx-deploy nginx=nginx:1.17
```
*(Nếu tên container được sinh ra là `nginx-deploy` thay vì `nginx`, hãy dùng: `kubectl set image deployment/nginx-deploy nginx-deploy=nginx:1.17`)*

**Cách kiểm tra tên container nhanh:**
```bash
kubectl get deploy nginx-deploy -o jsonpath='{.spec.template.spec.containers[0].name}'
```

### Bước 3: Thêm Annotation ghi chú thay đổi (Change Cause)
Đề thi CKA yêu cầu ghi chú lại lý do thay đổi phiên bản. Để làm việc này, ta thêm annotation `kubernetes.io/change-cause` vào deployment:
```bash
kubectl annotate deployment/nginx-deploy kubernetes.io/change-cause="Updated nginx image to 1.17"
```

---

## 🔍 Kiểm tra kết quả (Verification)

1. **Kiểm tra lịch sử nâng cấp (Rollout History):**
   ```bash
   kubectl rollout history deployment/nginx-deploy
   ```
   *Kết quả mong muốn:*
   ```text
   REVISION  CHANGE-CAUSE
   1         <none>
   2         Updated nginx image to 1.17
   ```

2. **Kiểm tra phiên bản Image hiện tại đang chạy:**
   ```bash
   kubectl describe deploy nginx-deploy | grep -i image
   ```
   *Kết quả phải hiển thị `nginx:1.17`.*

---

## ⚠️ Lưu ý khi đi thi:
Trước đây, cờ `--record` được dùng trực tiếp trong lệnh `kubectl set image` để tự động ghi nhận lệnh vào `change-cause`. Tuy nhiên, cờ `--record` **đã bị khai tử (deprecated)** trong các bản Kubernetes mới gần đây. Do đó, việc sử dụng lệnh `kubectl annotate` riêng biệt sau khi nâng cấp là cách làm chuẩn mực nhất hiện nay để đảm bảo không bị lỗi cú pháp khi thi.
