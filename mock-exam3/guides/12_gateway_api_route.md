# Lời giải Mock Exam 3 - Câu 12: Phân chia lưu lượng với Gateway API HTTPRoute (6 điểm)

Bài tập này kiểm tra kỹ năng quản lý mạng thế hệ mới (Modern Networking), cụ thể là sử dụng **HTTPRoute** của Gateway API để phân chia lưu lượng truy cập (Traffic Splitting / Canary Deployment) giữa 2 phiên bản dịch vụ (`web-service` tỷ lệ 80% và `web-service-v2` tỷ lệ 20%).

---

## 🔍 Quy trình chuẩn bị (Namespace & Port Diagnostic)

Trước tiên, ta cần biết các dịch vụ và Gateway đang chạy ở namespace nào và lắng nghe ở cổng (port) nào.

### Bước 1: Tìm namespace và cổng của các dịch vụ `web-service`
Em chạy lệnh quét toàn cụm:
```bash
kubectl get svc -A | grep web-service
```
**Ghi nhận:**
* Tên **Namespace** của dịch vụ (ví dụ: `default` hoặc một namespace riêng).
* Cổng **Port** dịch vụ đang mở (thường là `80` hoặc `8080`).

### Bước 2: Tìm namespace của `web-gateway`
```bash
kubectl get gateway -A
```
**Ghi nhận:** Tên Namespace của `web-gateway` (phải khai báo đúng namespace này cho HTTPRoute hoặc dùng `parentRefs.namespace`).

---

## 🛠️ Quy trình thực hiện (Dùng YAML)

Sau khi có Namespace và Port (giả sử là namespace `default` và cổng `80`), ta tạo file `/tmp/web-route.yaml`:

### Bước 3: Tạo file cấu hình `web-route.yaml`
```bash
cat <<EOF > /tmp/web-route.yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: web-route
  namespace: default              # 👈 Đảm bảo khai báo đúng namespace ở Bước 1
spec:
  parentRefs:
  - name: web-gateway             # 👈 Trỏ đến Gateway quản lý
  rules:
  - backendRefs:
    - name: web-service
      port: 80                    # 👈 Cổng của web-service tìm thấy ở Bước 1
      weight: 80                  # 👈 Trọng số 80%
    - name: web-service-v2
      port: 80                    # 👈 Cổng của web-service-v2
      weight: 20                  # 👈 Trọng số 20%
EOF
```

### Bước 4: Khởi tạo HTTPRoute trong cụm
```bash
kubectl apply -f /tmp/web-route.yaml
```

---

## 🔍 Kiểm tra kết quả (Verification)

### 1. Kiểm tra trạng thái HTTPRoute:
```bash
kubectl get httproute web-route -o yaml
```
*Đảm bảo các trường `parentRefs` trỏ đúng Gateway, và `backendRefs` có đủ 2 dịch vụ với đúng trọng số `80` và `20`.*
