# Lời giải Mock Exam 2 - Câu 5: Tạo CSR & Phân quyền RBAC (10 điểm)

Bài tập này kiểm tra kỹ năng Quản lý Bảo mật (Security & RBAC), yêu cầu duyệt yêu cầu ký số (CertificateSigningRequest - CSR) để cấp quyền truy cập cụm cho lập trình viên mới, đồng thời phân quyền tương ứng bằng `Role` và `RoleBinding`.

---

## 🛠️ Quy trình thực hiện (Step-by-step)

### Bước 1: Tạo Namespace `development` (nếu chưa có)
```bash
kubectl create namespace development
```

### Bước 2: Tạo đối tượng CertificateSigningRequest (CSR)
Để ký số cho User `john`, ta cần lấy nội dung CSR mã hóa base64 từ file có sẵn `/root/CKA/john.csr` và truyền vào file cấu hình.

Em chạy khối lệnh sau để tự động lấy mã base64 và sinh file `/tmp/john-csr.yaml`:

```bash
# 1. Nạp nội dung CSR đã được mã hóa base64 và xóa các dấu xuống dòng
export CSR_BASE64=$(cat /root/CKA/john.csr | base64 | tr -d '\n')

# 2. Sinh file YAML chứa mã base64
cat <<EOF > /tmp/john-csr.yaml
apiVersion: certificates.k8s.io/v1
kind: CertificateSigningRequest
metadata:
  name: john-developer
spec:
  request: $CSR_BASE64
  signerName: kubernetes.io/kube-apiserver-client  # 👈 SignerName chuẩn để xác thực Client
  usages:
  - client auth
EOF
```

### Bước 3: Apply CSR và duyệt yêu cầu (Approve CSR)
1. Tạo CSR:
   ```bash
   kubectl apply -f /tmp/john-csr.yaml
   ```
2. Phê duyệt yêu cầu ký số để cấp chứng chỉ cho John:
   ```bash
   kubectl certificate approve john-developer
   ```

---

### Bước 4: Tạo Role `developer` trong namespace `development`
Dùng lệnh imperative gõ nhanh để tạo `Role` cấp quyền `create, list, get, update, delete` trên tài nguyên `pods`:
```bash
kubectl create role developer \
  -n development \
  --verb=create,list,get,update,delete \
  --resource=pods
```

### Bước 5: Tạo RoleBinding liên kết User `john` với Role `developer`
```bash
kubectl create rolebinding developer-binding-john \
  -n development \
  --role=developer \
  --user=john
```

---

## 🔍 Kiểm tra kết quả (Verification)

### 1. Kiểm tra trạng thái CSR:
```bash
kubectl get csr john-developer
```
*Kết quả:* Cột `CONDITION` phải hiển thị là **`Approved,Issued`**.

### 2. Kiểm tra quyền truy cập của User `john` (Kiểm thử RBAC):
Sử dụng lệnh `kubectl auth can-i` để đóng vai User `john` kiểm tra quyền hạn của mình:
* Kiểm tra xem John có thể tạo Pod trong namespace `development` không:
  ```bash
  kubectl auth can-i create pods -n development --as=john
  ```
  *Kết quả phải trả về:* **`yes`**.
* Kiểm tra xem John có thể tạo Pod ở namespace `default` không:
  ```bash
  kubectl auth can-i create pods -n default --as=john
  ```
  *Kết quả phải trả về:* **`no`** (Vì John chỉ được phân quyền trong namespace `development`).
