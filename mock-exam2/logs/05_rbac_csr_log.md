# Nhật ký Thực hành Mock Exam 2 - Câu 5: Tạo CSR & Phân quyền RBAC

Tài liệu này lưu trữ quá trình khởi tạo đối tượng CertificateSigningRequest (CSR) cho User `john`, phê duyệt chứng chỉ và cấu hình phân quyền RBAC thành công.

---

## 💻 Các lệnh đã thực thi

1. **Khởi tạo và apply file CSR cấu hình (`/tmp/john-csr.yaml`):**
   ```bash
   export CSR_BASE64=$(cat /root/CKA/john.csr | base64 | tr -d '\n')
   cat <<EOF > /tmp/john-csr.yaml
   apiVersion: certificates.k8s.io/v1
   kind: CertificateSigningRequest
   metadata:
     name: john-developer
   spec:
     request: $CSR_BASE64
     signerName: kubernetes.io/kube-apiserver-client
     usages:
     - client auth
   EOF
   kubectl apply -f /tmp/john-csr.yaml
   ```
   *Output:* `certificatesigningrequest.certificates.k8s.io/john-developer created`

2. **Duyệt yêu cầu ký số (Approve CSR):**
   ```bash
   kubectl certificate approve john-developer
   ```
   *Output:* `certificatesigningrequest.certificates.k8s.io/john-developer approved`

3. **Tạo Role phân quyền:**
   ```bash
   kubectl create role developer \
     -n development \
     --verb=create,list,get,update,delete \
     --resource=pods
   ```
   *Output:* `role.rbac.authorization.k8s.io/developer created`

4. **Tạo RoleBinding liên kết User john:**
   ```bash
   kubectl create rolebinding developer-binding-john \
     -n development \
     --role=developer \
     --user=john
   ```
   *Output:* `rolebinding.rbac.authorization.k8s.io/developer-binding-john created`

5. **Xác thực phân quyền (can-i check):**
   ```bash
   kubectl auth can-i create pods -n development --as=john
   ```
   *Output thực tế:* `yes`
   *(Nhận xét: Quyền truy cập của John đã được phê duyệt và cấu hình chính xác theo Role Binding).*
