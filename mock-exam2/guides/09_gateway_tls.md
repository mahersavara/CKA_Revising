# Lời giải Mock Exam 2 - Câu 9: Cấu hình HTTPS TLS cho Gateway API (10 điểm)

Bài tập này kiểm tra kỹ năng cấu hình bảo mật HTTPS và quản lý chứng chỉ ký số TLS trên Gateway API thế hệ mới trong cụm Kubernetes.

---

## 🛠️ Quy trình thực hiện (Step-by-step)

### Bước 1: Xem cấu hình Gateway `web-gateway` hiện tại
Trước khi chỉnh sửa, em nên xem qua cấu hình hiện có của đối tượng:
```bash
kubectl get gateway web-gateway -n cka5673 -o yaml
```

### Bước 2: Chỉnh sửa cấu hình Gateway trực tiếp
Sử dụng lệnh `kubectl edit` để sửa đổi trực tiếp đối tượng trên cụm:
```bash
kubectl edit gateway web-gateway -n cka5673
```

Tìm đến phần `listeners:` và chỉnh sửa hoặc bổ sung cấu hình HTTPS với TLS:

```yaml
spec:
  gatewayClassName: nginx
  listeners:
  - name: https                 # Tên listener (tùy ý, ví dụ: https)
    protocol: HTTPS             # Giao thức HTTPS
    port: 443                   # Cổng 443
    hostname: kodekloud.com      # Tên miền (hostname) yêu cầu
    tls:
      mode: Terminate           # Chế độ TLS (Terminate)
      certificateRefs:
      - kind: Secret            # Đối tượng chứa cert là Secret
        name: kodekloud-tls     # Tên Secret chứa chứng chỉ TLS
```

*(Nhấn `Esc` -> gõ `:wq` -> `Enter` để lưu và thoát).*

---

## 🔍 Kiểm tra kết quả (Verification)

### 1. Xem lại cấu hình chi tiết:
```bash
kubectl describe gateway web-gateway -n cka5673
```

*Đảm bảo các thuộc tính sau đã được cập nhật chính xác:*
* **`Port:`** `443`
* **`Protocol:`** `HTTPS`
* **`Hostname:`** `kodekloud.com`
* **`TLS Mode:`** `Terminate`
* **`Certificate Refs:`** `Secret/kodekloud-tls`

### 2. Kiểm tra xem Gateway có được lập trình (Programmed) thành công không:
```bash
kubectl get gateway -n cka5673
```
*Kết quả:* Cột `PROGRAMMED` (hoặc `ACCEPTED`) phải hiển thị trạng thái là **`True`**.
