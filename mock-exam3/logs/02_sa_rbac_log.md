# Nhật ký Thực hành Mock Exam 3 - Câu 2: Phân quyền ServiceAccount & RBAC cho Pod

Tài liệu này lưu trữ quá trình khởi tạo ServiceAccount `pvviewer`, gán ClusterRole `pvviewer-role` và khởi tạo Pod `pvviewer` sử dụng ServiceAccount thành công.

---

## 💻 Các lệnh đã thực thi

1. **Tạo ServiceAccount:**
   ```bash
   kubectl create serviceaccount pvviewer
   ```
   *Output:* `serviceaccount/pvviewer created`

2. **Tạo ClusterRole:**
   ```bash
   kubectl create clusterrole pvviewer-role --verb=get,list --resource=persistentvolumes
   ```
   *Output:* `clusterrole.rbac.authorization.k8s.io/pvviewer-role created`

3. **Tạo ClusterRoleBinding:**
   ```bash
   kubectl create clusterrolebinding pvviewer-role-binding --clusterrole=pvviewer-role --serviceaccount=default:pvviewer
   ```
   *Output:* `clusterrolebinding.rbac.authorization.k8s.io/pvviewer-role-binding created`

4. **Khởi tạo và cấu hình Pod (`/tmp/pvviewer.yaml`):**
   ```bash
   kubectl run pvviewer --image=redis --dry-run=client -o yaml > /tmp/pvviewer.yaml
   ```
   *Cấu hình đã bổ sung:*
   ```yaml
   spec:
     serviceAccountName: pvviewer
     containers:
     - name: pvviewer
       image: redis
   ```
   *Apply cấu hình:*
   ```bash
   kubectl apply -f /tmp/pvviewer.yaml
   ```
   *Output:* `pod/pvviewer created`

5. **Xác nhận kết quả:**
   ```bash
   kubectl get pod pvviewer -o jsonpath='{.spec.serviceAccountName}'
   ```
   *Output thực tế:* `pvviewer`
   *(Nhận xét: Pod pvviewer đã được khởi chạy thành công và liên kết chính xác với ServiceAccount pvviewer).*
