# Lời giải Mock Exam 1 - Câu 11: Khởi tạo Kubernetes Gateway API (9 điểm)

Bài tập này kiểm tra kỹ năng kết nối mạng hiện đại (Modern Networking), cụ thể là sử dụng Gateway API (phiên bản thay thế nâng cao cho Ingress truyền thống) để định cấu hình định tuyến bên ngoài cụm.

---

## 🛠️ Quy trình thực hiện (Dùng YAML)

Gateway API là một tài nguyên mở rộng, bắt buộc phải viết bằng file YAML cấu hình.

### Bước 1: Tạo file cấu hình `gateway.yaml`
Cú pháp YAML chuẩn cấu hình một Gateway lắng nghe trên cổng 80:

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: web-gateway
  namespace: nginx-gateway   # 👈 Đảm bảo chạy trong đúng namespace đề yêu cầu
spec:
  gatewayClassName: nginx     # Gateway Class Name được cung cấp
  listeners:
  - name: http
    protocol: HTTP
    port: 80                  # Cổng lắng nghe HTTP 80
```

### Bước 2: Áp dụng tạo Gateway trong cụm
```bash
kubectl apply -f gateway.yaml
```

---

## 🔍 Kiểm tra kết quả (Verification)

### ⚠️ Lỗi hay gặp khi kiểm tra (Namespace Gotcha):
Vì Gateway được tạo trong namespace `nginx-gateway`, nếu em chỉ chạy `kubectl get gateway` thì nó sẽ tìm ở namespace `default` và báo: `No resources found in default namespace`.

### Bước 3: Kiểm tra đúng namespace
* **Cách 1: Kiểm tra ở tất cả namespace:**
  ```bash
  kubectl get gateway -A
  ```
* **Cách 2: Chỉ định cụ thể namespace:**
  ```bash
  kubectl get gateway -n nginx-gateway
  ```

*Yêu cầu kết quả:*
* Trạng thái **`PROGRAMMED`** (hoặc `READY`) phải hiển thị là **`True`** (Chứng tỏ Gateway Controller như NGINX Gateway đã nhận diện và cấu hình thành công).
