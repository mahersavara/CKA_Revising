# Chuyên đề 13: Cấu Hình Network Policies và Cài Đặt CNI (Câu 20, 66, 70)

Chuyên đề này hướng dẫn các thao tác quản lý bảo mật mạng trong cụm Kubernetes bằng cách cấu hình **NetworkPolicy** để giới hạn luồng mạng đi vào/đi ra (Ingress/Egress) và cách lựa chọn, cài đặt **Container Network Interface (CNI)** hỗ trợ NetworkPolicy.

---

## 🔌 1. Lựa chọn và cài đặt CNI có hỗ trợ NetworkPolicy (Câu 20)

**Đề bài:** Cụm Kubernetes vừa bị gỡ bỏ CNI cũ do lỗi bảo mật. Bạn được yêu cầu cài đặt một CNI mới để thực thi các NetworkPolicy. Đề bài đưa ra 2 lựa chọn: **Flannel v0.26.1** hoặc **Calico v3.28.2**.

### Phân tích & Lựa chọn CNI:
* **Flannel:** Cực kỳ đơn giản, chỉ hỗ trợ kết nối mạng cơ bản giữa các Pod mà **KHÔNG** hỗ trợ thực thi các luật NetworkPolicy.
* **Calico:** Hỗ trợ đầy đủ việc cấu hình và thực thi NetworkPolicy ở cấp độ Layer 3/4.
* **Quyết định:** Bạn bắt buộc phải chọn **Calico**. Việc chọn Flannel sẽ dẫn đến chấm điểm **0**.

### Các bước cài đặt:
1. SSH vào Master Node:
   ```bash
   ssh cka000054
   ```
2. Áp dụng tài liệu manifest Calico chính thức được cung cấp trong đề bài:
   ```bash
   kubectl apply -f https://raw.githubusercontent.com/projectcalico/calico/v3.28.2/manifests/tigera-operator.yaml
   ```
3. Đợi các Pod thuộc namespace `tigera-operator` và `calico-system` khởi động thành công (`Running`):
   ```bash
   kubectl get pods -n tigera-operator
   kubectl get pods -n calico-system
   ```

---

## 🛡️ 2. Tạo mới NetworkPolicy hạn chế truy cập (Câu 66)

**Đề bài:** Tạo một NetworkPolicy tên `allow-port-from-namespace` trong namespace `echo`. 
* Cho phép các Pod trong namespace `my-app` kết nối tới cổng `9000` của các Pod trong namespace `echo`.
* Chặn mọi truy cập khác tới cổng không phải `9000` hoặc từ namespace không phải `my-app`.

### Phân tích logic NetworkPolicy:
Khi ta áp dụng NetworkPolicy cho các Pod trong namespace `echo` bằng một rules Ingress chỉ định, Kubernetes sẽ tự động áp dụng cơ chế **Default Deny** (chặn mọi kết nối khác không được khai báo rõ ràng).

### File YAML cấu hình chính xác (`network.yaml`):
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-port-from-namespace
  namespace: echo                    # 👈 Áp dụng vào namespace đích
spec:
  podSelector: {}                    # 👈 Rỗng tức là áp dụng cho TẤT CẢ Pods trong namespace "echo"
  policyTypes:
  - Ingress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          kubernetes.io/metadata.name: my-app  # 👈 Lọc namespace nguồn
    ports:
    - protocol: TCP
      port: 9000                     # 👈 Chỉ cho phép cổng 9000
```
*Lệnh tạo:* `kubectl apply -f network.yaml`

*Phân tích lỗi của đề SurePass:*
Trong đáp án giải thích của SurePass (trang 81) ghi namespace là `internal` và cổng là `8080`. Đây là cấu hình sai lệch so với đề bài mô tả. Khi đi thi thực tế, hãy bám sát 100% các từ khóa trong đề thi (namespace `echo`, namespace nguồn `my-app`, port `9000`).

---

## 🔍 3. Lựa chọn NetworkPolicy phù hợp từ thư mục mẫu (Câu 70)

**Đề bài:** Đề bài cung cấp sẵn một số file cấu hình NetworkPolicy trong thư mục `~/netpol/`. Bạn cần kiểm tra các file này, lựa chọn file tối ưu nhất (không quá lỏng lẻo nhưng đủ đáp ứng yêu cầu kết nối giữa `frontend` và `backend`) và áp dụng nó mà không được chỉnh sửa nội dung file.

### Quy trình thực hiện:
1. **Kiểm tra thông số nhãn (Labels) của frontend và backend:**
   ```bash
   kubectl get deploy -n frontend --show-labels
   kubectl get deploy -n backend --show-labels
   ```
   Giả sử:
   * Pod frontend có nhãn: `app: frontend`
   * Pod backend có nhãn: `app: backend`

2. **Đọc nội dung các file cấu hình trong `~/netpol/`:**
   ```bash
   ls ~/netpol/
   cat ~/netpol/policy-1.yaml
   cat ~/netpol/policy-2.yaml
   ```

3. **Tiêu chí lựa chọn file đúng:**
   * File phải được triển khai trong namespace của Pod bị giới hạn (ví dụ `namespace: backend`).
   * `podSelector` phải lọc đúng nhãn của Pod nhận traffic (ví dụ `matchLabels: { app: backend }`).
   * `ingress.from` phải lọc đúng namespace chứa nguồn gửi traffic bằng `namespaceSelector` (ví dụ `name: frontend` hoặc `kubernetes.io/metadata.name: frontend`).
   * Nếu có thể, nên có thêm `podSelector` lọc chi tiết hơn nữa nguồn gửi (ví dụ `matchLabels: { app: frontend }`) để tăng tính bảo mật (tránh "overly permissive" - quá lỏng lẻo).

4. **Áp dụng file đúng đã chọn:**
   ```bash
   kubectl apply -f ~/netpol/policy-x.yaml  # Với x là số của file bạn chọn là đúng nhất
   ```
