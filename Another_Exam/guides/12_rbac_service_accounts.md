# Chuyên đề 12: RBAC - ServiceAccount, ClusterRole và Binding (Câu 17)

Kiểm soát truy cập dựa trên vai trò (Role-Based Access Control - RBAC) là thành phần bảo mật cốt lõi của Kubernetes. Bài tập này yêu cầu bạn tạo một ServiceAccount, một ClusterRole phân quyền và liên kết chúng lại bằng một RoleBinding giới hạn trong một namespace nhất định.

---

## 📋 Phân tích đề bài (Câu 17)
* **Yêu cầu 1:** Tạo một ClusterRole tên `deployment-clusterrole` chỉ cho phép quyền `create` đối với các tài nguyên: `Deployment`, `StatefulSet`, `DaemonSet`.
* **Yêu cầu 2:** Tạo một ServiceAccount tên `cicd-token` trong namespace `app-team1`.
* **Yêu cầu 3:** Liên kết ClusterRole với ServiceAccount trên, giới hạn quyền hạn trong phạm vi namespace `app-team1`.

---

## 🛠️ Quy trình thực hiện bằng lệnh nhanh (Imperative Commands)

Sử dụng lệnh nhanh là cách tối ưu nhất để tránh viết sai cú pháp YAML trong phòng thi.

### Bước 1: Tạo ClusterRole
Chạy lệnh tạo ClusterRole cấp độ cụm:
```bash
kubectl create clusterrole deployment-clusterrole \
  --verb=create \
  --resource=deployments,statefulsets,daemonsets
```
*Giải thích:*
* `--verb=create`: Chỉ cấp quyền tạo mới tài nguyên.
* `--resource=deployments,statefulsets,daemonsets`: Danh sách tài nguyên được áp dụng (viết dạng số nhiều, viết liền không khoảng cách).

### Bước 2: Tạo ServiceAccount trong namespace chỉ định
```bash
kubectl create serviceaccount cicd-token -n app-team1
```

### Bước 3: Tạo RoleBinding để liên kết (Giới hạn trong namespace)
*Lưu ý cực kỳ quan trọng:* Đề bài yêu cầu **"limited to the namespace app-team1"**. Do đó:
* Bạn phải dùng **`RoleBinding`** chứ không được dùng `ClusterRoleBinding`.
* Trỏ tham số `--serviceaccount` chính xác tới namespace `app-team1`.

Lệnh chạy chính xác:
```bash
kubectl create rolebinding deployment-clusterrole-binding \
  --clusterrole=deployment-clusterrole \
  --serviceaccount=app-team1:cicd-token \
  -n app-team1
```

*Phân tích lỗi của đề SurePass:*
Trong đáp án giải thích của SurePass (trang 17) ghi lệnh:
`kubectl create rolebinding deployment-clusterrole --clusterrole=deployment-clusterrole --serviceaccount=default:cicd-token --namespace=app-team1`
Đây là một **LỖI NGHIÊM TRỌNG** của tài liệu thi. Việc khai báo `--serviceaccount=default:cicd-token` sẽ trỏ tới ServiceAccount `cicd-token` trong namespace `default` (vốn không tồn tại hoặc không đúng yêu cầu), làm cho RoleBinding không có tác dụng đối với ServiceAccount trong namespace `app-team1`. Bạn hãy luôn sử dụng định dạng đúng: `--serviceaccount=<namespace-của-SA>:<tên-SA>`.

---

## 🔍 Kiểm tra kết quả (Verification)

### 1. Kiểm tra mô tả của RoleBinding để đảm bảo gắn đúng đối tượng:
```bash
kubectl describe rolebinding deployment-clusterrole-binding -n app-team1
```
*Kết quả mong muốn:*
```text
Name:         deployment-clusterrole-binding
Namespace:    app-team1
Role:
  Kind:  ClusterRole
  Name:  deployment-clusterrole
Subjects:
  Kind            Name        Namespace
  ----            ----        ---------
  ServiceAccount  cicd-token  app-team1    # 👈 Phải hiển thị đúng namespace app-team1
```

### 2. Kiểm tra phân quyền thực tế (Lệnh Test cực hay):
Dùng công cụ `auth can-i` để đóng vai (impersonate) ServiceAccount và kiểm tra xem có tạo được Deployment trong namespace `app-team1` không:
```bash
# Kiểm tra tạo Deployment ở app-team1 (phải trả về yes)
kubectl auth can-i create deployment --as=system:serviceaccount:app-team1:cicd-token -n app-team1

# Kiểm tra tạo Deployment ở namespace khác, ví dụ default (phải trả về no)
kubectl auth can-i create deployment --as=system:serviceaccount:app-team1:cicd-token -n default
```
Nếu lệnh thứ nhất ra `yes` và lệnh thứ hai ra `no`, bạn đã hoàn thành bài thi xuất sắc và chính xác 100%!
