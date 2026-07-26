# Lời giải Mock Exam 3 - Câu 9: Troubleshoot Kubeconfig File `/root/CKA/super.kubeconfig` (8 điểm)

Bài tập này kiểm tra kỹ năng cấu hình và kết nối cụm (Cluster Infrastructure & Security), cụ thể là chẩn đoán lỗi trong file cấu hình truy cập cụm (kubeconfig) khiến các lệnh điều khiển qua file đó bị lỗi.

---

## 🔍 Quy trình chẩn đoán sự cố (Troubleshooting Workflow)

Để biết file `super.kubeconfig` đang bị cấu hình sai trường nào, ta cần so sánh nó với file config chuẩn của cụm đang hoạt động ổn định (nằm tại `/root/.kube/config`).

### Bước 1: Xem nội dung file `super.kubeconfig` lỗi
```bash
cat /root/CKA/super.kubeconfig
```

### Bước 2: Xem nội dung file config chuẩn đang hoạt động để đối chiếu
```bash
cat /root/.kube/config
```

---

## 💡 Các lỗi hay gặp trong Kubeconfig (Kubeconfig Pitfalls):

1. **Sai Cổng API Server (Server Port):**
   * Trong file lỗi có thể ghi: `server: https://controlplane:9999` (Cổng 9999 là sai).
   * Cổng chuẩn của Kubernetes API Server luôn là **`6443`** (ví dụ: `https://controlplane:6443` hoặc `https://127.0.0.1:6443`).
2. **Mâu thuẫn Context / Cluster / User:**
   * Tên trong trường `current-context` bị chỉ định sai (lệch tên với context khai báo ở dưới).
   * Context chỉ định đến một `cluster` hoặc `user` không tồn tại ở danh sách phía dưới.
3. **Sai đường dẫn chứng chỉ (Certificates/Keys Path):**
   * Các đường dẫn trỏ đến file CA, Client Cert, Client Key bị gõ sai tên file hoặc sai đường dẫn thư mục.

---

## 🛠️ Quy trình sửa lỗi

1. **Mở file lỗi bằng `nano`:**
   ```bash
   nano /root/CKA/super.kubeconfig
   ```
2. **Đối chiếu và sửa các trường bị lệch:**
   * Sửa cổng `9999` thành **`6443`** (nếu có).
   * Đảm bảo các khối liên kết trùng khớp tên nhau (`user`, `cluster`, `context`).
3. **Lưu lại file** (`Ctrl + O` -> `Enter` -> `Ctrl + X`).

---

## 🔍 Kiểm tra kết quả (Verification)

Sử dụng file config vừa sửa để thực thi một lệnh truy vấn cụm:
```bash
kubectl get nodes --kubeconfig=/root/CKA/super.kubeconfig
```
*Kết quả đúng:* Liệt kê thành công danh sách các Node trong cụm mà không báo bất kỳ lỗi kết nối (Connection Refused, Bad Certificate, v.v.).
