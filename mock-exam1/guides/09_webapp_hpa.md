# Lời giải Mock Exam 1 - Câu 9: Cấu hình Horizontal Pod Autoscaler (HPA) (10 điểm)

Bài tập này kiểm tra kỹ năng tự động điều chỉnh quy mô Pod (Auto-scaling) dựa trên tài nguyên CPU sử dụng, đồng thời cấu hình hành vi mở rộng nâng cao (advanced scaling behavior) như thời gian ổn định (stabilization window) để tránh hiện tượng dao động số lượng Pod quá nhanh (thrashing).

---

## 🛠️ Quy trình thực hiện (Dùng YAML)

HPA với cấu hình hành vi nâng cao (behavior) yêu cầu API version là **`autoscaling/v2`** và bắt buộc phải viết bằng file YAML.

### Bước 1: Tạo file cấu hình `/root/webapp-hpa.yaml`

Có **2 cách** để lấy nhanh cấu trúc (Template) của HPA khi đi thi:

#### Cách A: Dùng lệnh gõ nhanh sinh tự động (Khuyên dùng)
Em dùng lệnh `kubectl autoscale` kèm theo cờ `--dry-run=client -o yaml` để hệ thống tự sinh ra toàn bộ khung YAML HPA cực kỳ sạch:
```bash
kubectl autoscale deployment kkapp-deploy \
  --name=webapp-hpa \
  --cpu-percent=50 \
  --min=1 \
  --max=10 \
  --dry-run=client -o yaml > /root/webapp-hpa.yaml
```
*Lưu ý:* Lệnh này sẽ tự động tạo file `/root/webapp-hpa.yaml` với phiên bản mới nhất `autoscaling/v2`. Em chỉ cần dùng `nano` mở file lên và bổ sung thêm khối cấu hình `behavior` vào cuối file `spec` là xong.

#### Cách B: Tra cứu trên trang tài liệu chính thức (`kubernetes.io/docs`)
1. Gõ từ khóa tìm kiếm: **`hpa behavior`** hoặc **`horizontal pod autoscaler`**.
2. Click vào bài viết: *"Horizontal Pod Autoscaler"* hoặc *"Support for configurable scaling behaviors"*.
3. Copy khối YAML có chứa thẻ `behavior` và dán vào file bài làm của mình.

---

Sau khi đã có file cấu hình, hãy mở file `/root/webapp-hpa.yaml` lên:
```bash
nano /root/webapp-hpa.yaml
```
Và chỉnh sửa cho khớp hoàn chỉnh với file mẫu bên dưới (thêm phần `behavior` vào cuối):

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: webapp-hpa
  namespace: default
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: kkapp-deploy
  minReplicas: 1
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 50
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300  # 👈 Bổ sung phần này
```


### Bước 2: Apply cấu hình khởi tạo HPA
```bash
kubectl apply -f /root/webapp-hpa.yaml
```

---

## 🔍 Kiểm tra kết quả (Verification)

### 1. Kiểm tra trạng thái HPA:
```bash
kubectl get hpa webapp-hpa
```
*Kết quả mong muốn:*
```text
NAME         REFERENCE                 TARGETS         MINPODS   MAXPODS   REPLICAS   AGE
webapp-hpa   Deployment/kkapp-deploy   <unknown>/50%   1         10        1          10s
```
*(Lưu ý: Mục TARGETS có thể hiển thị `<unknown>/50%` lúc mới tạo vì Metrics Server cần vài chục giây để thu thập dữ liệu CPU từ Pod. Điều này là bình thường).*

### 2. Kiểm tra chi tiết cấu hình nâng cao:
```bash
kubectl describe hpa webapp-hpa
```
Em kéo xuống phần **`Behavior`** ở cuối, kiểm tra xem đã có cấu hình sau chưa:
* **`Scale Down:`**
  * **`Stabilization Window:`** `300 seconds`

Nếu phần này hiển thị đúng `300 seconds`, em đã hoàn thành xuất sắc câu này!
