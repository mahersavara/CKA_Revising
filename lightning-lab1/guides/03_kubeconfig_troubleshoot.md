# Lời giải & Hướng dẫn: Troubleshoot Kubeconfig (`admin.kubeconfig`)

Trong kỳ thi CKA, các bài toán sửa file cấu hình kết nối (`kubeconfig`) rất hay xuất hiện (thường trị giá 8 - 10 điểm). Yêu cầu là phát hiện lỗi cấu hình khiến `kubectl` không thể giao tiếp với API Server và sửa lại cho đúng.

---

## 🔍 Cách tìm nguyên nhân lỗi (Troubleshooting Workflow)

Khi gặp một file kubeconfig bị lỗi (ví dụ `/root/CKA/admin.kubeconfig`), hãy thực hiện các bước kiểm tra sau để bắt bệnh:

### Bước 1: Test thử kết nối bằng file cấu hình lỗi
Chạy lệnh kèm cờ `--kubeconfig` để xem thông báo lỗi cụ thể:
```bash
kubectl --kubeconfig=/root/CKA/admin.kubeconfig get nodes
```
*Các lỗi phổ biến xuất hiện:*
* **`Unable to connect to the server: dial tcp ...: i/o timeout`**: Lỗi sai IP hoặc sai Port của API Server.
* **`Unable to connect to the server: x509: certificate signed by unknown authority`**: Lỗi sai đường dẫn file chứng chỉ CA (`certificate-authority`) hoặc nội dung chứng chỉ bị lỗi.
* **`unauthorized` hoặc `Forbidden`**: Lỗi liên quan đến Client Certificate hoặc Token/User credentials.

### Bước 2: Xem nội dung file cấu hình
```bash
cat /root/CKA/admin.kubeconfig
```
Hãy chú ý kỹ vào phần `clusters.cluster.server`:
```yaml
apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: ...
    server: https://controlplane:1234  # ⚠️ SAI PORT! Thường API Server chạy ở port 6443
  name: kubernetes
...
```

### Bước 3: Tìm thông số đúng của API Server
Để biết chính xác IP và Port mà API Server đang lắng nghe, hãy kiểm tra file manifest tĩnh của API Server trên node controlplane:
```bash
# Kiểm tra port (thông số --secure-port)
grep -i secure-port /etc/kubernetes/manifests/kube-apiserver.yaml
# Mặc định là: --secure-port=6443

# Kiểm tra địa chỉ bind (thông số --advertise-address)
grep -i advertise-address /etc/kubernetes/manifests/kube-apiserver.yaml
```

---

## 🛠️ Cách sửa lỗi

### Phương pháp 1: Sửa trực tiếp bằng text editor (Khuyên dùng khi thi vì nhanh nhất)
Dùng `vi` hoặc `nano` để mở file:
```bash
nano /root/CKA/admin.kubeconfig
```
Tìm đến dòng `server: https://controlplane:XXXX` (hoặc `https://127.0.0.1:XXXX`) và sửa số port thành **`6443`**:
```yaml
    server: https://controlplane:6443
```
Lưu file (`Ctrl + O`, `Enter`, `Ctrl + X` trong nano).

### Phương pháp 2: Dùng lệnh `kubectl config` (Chuyên nghiệp)
Nếu không muốn mở file trực tiếp, em có thể dùng lệnh cấu hình của `kubectl`:
```bash
kubectl config --kubeconfig=/root/CKA/admin.kubeconfig set-cluster kubernetes --server=https://controlplane:6443
```
*(Trong đó `kubernetes` là tên cluster được khai báo ở trường `name` trong file kubeconfig).*

---

## ✅ Kiểm tra lại kết quả
Sau khi sửa, chạy lại lệnh để đảm bảo kết nối thành công:
```bash
kubectl --kubeconfig=/root/CKA/admin.kubeconfig get nodes
```
Nếu lệnh trả về danh sách các node ở trạng thái `Ready` thành công, em đã lấy trọn vẹn 8 điểm của câu này!
