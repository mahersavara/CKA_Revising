# Lời giải Mock Exam 1 - Câu 12: Nâng cấp Helm Chart (8 điểm)

Bài tập này kiểm tra kỹ năng quản lý gói ứng dụng bằng **Helm** (trình quản lý gói phổ biến nhất trong Kubernetes), cụ thể là cập nhật kho lưu trữ (repository) và nâng cấp (upgrade) phiên bản của một release đang chạy.

---

## 🔍 Quy trình thực hiện (Step-by-step)

### Bước 1: Thu thập thông tin Release và Repo
Trước tiên, em cần biết tên chart và kho lưu trữ (repo) nào đang được sử dụng.
1. **Kiểm tra Release hiện tại trong namespace `kk-ns`:**
   ```bash
   helm list -n kk-ns
   ```
   *Ghi nhận tên Chart (ví dụ: `podinfo-6.10.0`).*
2. **Kiểm tra danh sách các Repo đã thêm trong cụm:**
   ```bash
   helm repo list
   ```
   *Ghi nhận tên của Repo chứa chart podinfo (thường tên repo sẽ là `podinfo` hoặc tương tự).*

---

### Bước 2: Cập nhật Helm Repository để lấy phiên bản mới
```bash
helm repo update
```
*(Lệnh này tương tự như `apt-get update`, giúp Helm đồng bộ các phiên bản chart mới nhất từ internet về máy).*

---

### Bước 3: Tiến hành nâng cấp Release lên bản `6.11.2`
Sử dụng lệnh `helm upgrade` kèm tham số `--version` chỉ định và namespace `-n`:

Cú pháp tổng quát:
```bash
helm upgrade kk-mock1 <tên-repo>/<tên-chart> --version 6.11.2 -n kk-ns
```

*Ví dụ (Nếu tên repo là `podinfo` và tên chart là `podinfo`):*
```bash
helm upgrade kk-mock1 podinfo/podinfo --version 6.11.2 -n kk-ns
```

---

## 🔍 Kiểm tra kết quả (Verification)

### 1. Kiểm tra phiên bản Helm Release:
```bash
helm list -n kk-ns
```
*Yêu cầu kết quả:*
* Cột **`STATUS`** phải hiển thị là **`deployed`**.
* Cột **`CHART`** phải hiển thị đúng phiên bản mới là **`podinfo-6.11.2`**.

### 2. Kiểm tra xem các Pod của ứng dụng có đang chạy tốt không:
```bash
kubectl get pods -n kk-ns
```
*Tất cả các Pod liên quan đến `podinfo` phải ở trạng thái `Running`.*
