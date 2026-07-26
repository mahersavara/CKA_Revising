# Lời giải Mock Exam 1 - Câu 10: Khởi tạo Vertical Pod Autoscaler (VPA) (9 điểm)

Bài tập này kiểm tra kỹ năng tối ưu hóa tài nguyên tự động theo chiều dọc (Vertical Pod Autoscaling), yêu cầu tạo một VPA để tự động điều chỉnh yêu cầu CPU/Memory của các Pod thuộc Deployment.

---

## 🛠️ Quy trình thực hiện (Dùng YAML)

Vì `kubectl` không hỗ trợ lệnh sinh tự động (dry-run) cho VPA, ta bắt buộc phải viết file YAML cấu hình.

### Bước 1: Tạo file cấu hình `verticle.yaml`
Nội dung file cấu hình chuẩn của VPA với chế độ `Recreate`:

```yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: analytics-vpa
  namespace: default
spec:
  targetRef:
    apiVersion: "apps/v1"
    kind: Deployment
    name: analytics-deployment
  updatePolicy:
    updateMode: "Recreate" # Các chế độ hợp lệ: Off, Initial, Recreate, Auto
```

### Bước 2: Khởi tạo VPA trong cụm
```bash
kubectl apply -f verticle.yaml
```

---

## 🔍 Kiểm tra kết quả (Verification)

### 1. Kiểm tra danh sách VPA:
```bash
kubectl get vpa
```
*Yêu cầu kết quả:* 
* Dòng **`analytics-vpa`** phải hiển thị chế độ **`Recreate`** ở cột MODE.

### 2. Kiểm tra chi tiết cấu hình:
```bash
kubectl describe vpa analytics-vpa
```
*Đảm bảo phần `Update Policy` hiển thị đúng `Update Mode: Recreate` và `Target Ref` chỉ đúng đến Deployment `analytics-deployment`.*
