# Lời giải Mock Exam 2 - Câu 10: Xử lý và Gỡ bỏ Helm Release chứa lỗ hổng (10 điểm)

Bài tập này kiểm tra kỹ năng chẩn đoán sự cố (Troubleshooting) và Quản lý Ứng dụng bằng Helm, yêu cầu dò tìm tài nguyên chạy ảnh Docker có lỗ hổng bảo mật và gỡ bỏ ứng dụng đó qua Helm.

---

## 🔍 Quy trình thực hiện (Diagnostic & Execution)

### Bước 1: Dò tìm Pod/Deployment chạy ảnh lỗi `kodekloud/webapp-color:v1`
Ta cần quét toàn bộ cụm để xem tài nguyên lỗi nằm ở namespace nào:
```bash
kubectl get pods -A -o wide | grep -i "webapp-color"
```
*(Hoặc dùng lệnh lọc chi tiết hơn):*
```bash
kubectl get pods -A -o jsonpath='{range .items[*]}{.metadata.namespace}{"\t"}{.metadata.name}{"\t"}{range .spec.containers[*]}{.image}{"\t"}{end}{"\n"}{end}' | grep "kodekloud/webapp-color:v1"
```
**Ghi nhận:** Xác định tên **Namespace** và tên **Pod** chứa ảnh lỗi này.

---

### Bước 2: Dò tìm Helm Release tương ứng
1. Truy cập vào namespace vừa tìm được ở Bước 1 (ví dụ là `vulnerable-namespace` hoặc `default` hoặc một namespace cụ thể):
   ```bash
   helm list -n <tên-namespace-tìm-được>
   ```
2. So sánh tên của Helm Release trong danh sách với tên Pod/Deployment đang chạy để xác định chính xác tên **Release Name**.

---

### Bước 3: Gỡ bỏ (Uninstall) Helm Release chứa lỗ hổng
Khi đã có tên release và namespace:
```bash
helm uninstall <tên-release> -n <tên-namespace-tìm-được>
```

---

## 🔍 Kiểm tra kết quả (Verification)

1. **Xác nhận Helm Release đã biến mất:**
   ```bash
   helm list -n <tên-namespace-tìm-được>
   ```
   *Kết quả:* Không còn release nào trong danh sách.

2. **Xác nhận Pod chứa lỗ hổng đã bị tự động xóa sạch:**
   ```bash
   kubectl get pods -n <tên-namespace-tìm-được>
   ```
   *Kết quả:* Không còn Pod nào chạy ảnh lỗi nữa.
