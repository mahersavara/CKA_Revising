# Lời giải Mock Exam 3 - Câu 6: Cấu hình NetworkPolicy cho phép Ingress Traffic (8 điểm)

Bài tập này kiểm tra kỹ năng bảo mật mạng (Services & Networking), yêu cầu tạo một `NetworkPolicy` để mở cổng (allow) cho traffic đi vào Pod `np-test-1` trên cổng 80 từ mọi nguồn, ghi đè lên quy tắc chặn mặc định (default-deny) hiện có.

---

## 🛠️ Quy trình thực hiện (Step-by-step)

### Bước 1: Xác định nhãn (Labels) của Pod `np-test-1`
Mục tiêu là gán chính xác chính sách mạng vào Pod này thông qua `podSelector`.
Em chạy lệnh kiểm tra nhãn của Pod:
```bash
kubectl get pod np-test-1 --show-labels
```
*Kết quả thường thấy:* Nhãn là **`run=np-test-1`** (hoặc `app=np-test-1`). Hãy lấy chính xác nhãn này.

---

### Bước 2: Tạo file cấu hình NetworkPolicy `/tmp/ingress-to-nptest.yaml`
Để cho phép traffic từ **mọi nguồn** đi vào cổng 80 của Pod `np-test-1`, ta cấu hình một Ingress rule chỉ định cổng `80` nhưng **không định nghĩa trường `from`** (điều này đồng nghĩa với việc cho phép tất cả các nguồn).

Chạy khối lệnh sau để ghi file:

```bash
cat <<EOF > /tmp/ingress-to-nptest.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: ingress-to-nptest
  namespace: default
spec:
  podSelector:
    matchLabels:
      run: np-test-1              # 👈 Thay thế bằng nhãn chính xác tìm thấy ở Bước 1
  policyTypes:
  - Ingress
  ingress:
  - ports:
    - protocol: TCP
      port: 80                    # 👈 Cho phép cổng TCP 80
                                  # (Không khai báo khối 'from' để cho phép mọi nguồn)
EOF
```

---

### Bước 3: Áp dụng NetworkPolicy vào cụm
```bash
kubectl apply -f /tmp/ingress-to-nptest.yaml
```

---

## 🔍 Kiểm tra kết quả (Verification)

### 1. Kiểm tra danh sách NetworkPolicy:
```bash
kubectl get netpol
```
*Yêu cầu:* Cụm phải có cả `default-deny` (cũ) và `ingress-to-nptest` (mới).

### 2. Kiểm thử khả năng kết nối:
Chạy một Pod tạm thời để gửi request kiểm tra xem dịch vụ đã thông chưa:
```bash
kubectl run test-connection --image=busybox:1.28 --restart=Never --rm -it -- wget -qO- http://np-test-service
```
*Kết quả mong muốn:* Trả về thành công nội dung trang web (hoặc mã HTML), không bị treo hoặc báo lỗi kết nối.
