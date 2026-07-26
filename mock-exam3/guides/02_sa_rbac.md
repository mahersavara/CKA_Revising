# Lời giải Mock Exam 3 - Câu 2: Phân quyền ServiceAccount & RBAC cho Pod (8 điểm)

Bài tập này kiểm tra kỹ năng phân quyền bảo mật (Security & RBAC), cụ thể là tạo một `ServiceAccount`, gán quyền truy cập Cluster-wide (`ClusterRole` và `ClusterRoleBinding`), sau đó gán `ServiceAccount` này vào một Pod chạy trong cụm.

---

## 🛠️ Quy trình thực hiện (Step-by-step)

Tất cả các tài nguyên phân quyền RBAC đều có thể được tạo cực nhanh bằng lệnh gõ tắt (imperative commands).

### Bước 1: Tạo ServiceAccount `pvviewer`
```bash
kubectl create serviceaccount pvviewer
```

### Bước 2: Tạo ClusterRole `pvviewer-role`
Cấp quyền `list` (và `get` để xem chi tiết nếu cần) trên tài nguyên `persistentvolumes` (PV):
```bash
kubectl create clusterrole pvviewer-role \
  --verb=get,list \
  --resource=persistentvolumes
```

### Bước 3: Tạo ClusterRoleBinding `pvviewer-role-binding`
Liên kết ServiceAccount `pvviewer` trong namespace `default` với ClusterRole `pvviewer-role` vừa tạo:
```bash
kubectl create clusterrolebinding pvviewer-role-binding \
  --clusterrole=pvviewer-role \
  --serviceaccount=default:pvviewer
```

---

### Bước 4: Tạo Pod `pvviewer` sử dụng ServiceAccount `pvviewer`
Do lệnh `kubectl run` không hỗ trợ cờ trực tiếp để gán ServiceAccount, ta sẽ sinh file YAML mẫu rồi sửa đổi:

1. **Sinh file YAML tạm:**
   ```bash
   kubectl run pvviewer --image=redis --dry-run=client -o yaml > /tmp/pvviewer.yaml
   ```
2. **Mở file cấu hình `/tmp/pvviewer.yaml`:**
   ```bash
   nano /tmp/pvviewer.yaml
   ```
3. **Bổ sung trường `serviceAccountName: pvviewer` vào khối `spec`:**
   ```yaml
   spec:
     serviceAccountName: pvviewer  # 👈 Thêm dòng này ở đây
     containers:
     - name: pvviewer
       image: redis
   ```
   *(Nhấn `Ctrl + O` -> `Enter` để lưu, và `Ctrl + X` để thoát).*

4. **Khởi tạo Pod:**
   ```bash
   kubectl apply -f /tmp/pvviewer.yaml
   ```

---

## 🔍 Kiểm tra kết quả (Verification)

### 1. Kiểm tra trạng thái ServiceAccount của Pod:
```bash
kubectl get pod pvviewer -o jsonpath='{.spec.serviceAccountName}'
```
*Kết quả mong muốn:* **`pvviewer`**.

### 2. Kiểm thử xem Pod có thực sự liệt kê được PV không:
Chạy lệnh thử quyền của chính ServiceAccount này:
```bash
kubectl auth can-i list pv --as=system:serviceaccount:default:pvviewer
```
*Kết quả mong muốn:* **`yes`**.
