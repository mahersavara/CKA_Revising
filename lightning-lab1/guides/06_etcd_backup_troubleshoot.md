# Hướng dẫn chi tiết: Backup ETCD & Xử lý lỗi (10 điểm)

Lệnh sao lưu (backup) cơ sở dữ liệu ETCD là một trong những câu hỏi cơ bản và bắt buộc phải đạt điểm tối đa trong kỳ thi CKA.

---

## 🔍 Cách tìm thông số TLS chính xác của ETCD

Để backup được ETCD, bạn bắt buộc phải có các thông số chứng chỉ TLS. Cách nhanh nhất và luôn đúng là đọc file manifest của `etcd` tĩnh trên node `controlplane`:

```bash
cat /etc/kubernetes/manifests/etcd.yaml
```

Tìm các tham số cấu hình dạng `--xxxx-file` để lấy đường dẫn:
1. **Endpoint**: Lấy từ `--listen-client-urls` hoặc `--advertise-client-urls` (Thường là `https://127.0.0.1:2379`).
2. **CA Certificate**: Đường dẫn tại tham số `--trusted-ca-file` (Thường là `/etc/kubernetes/pki/etcd/ca.crt`).
3. **Server Certificate**: Đường dẫn tại tham số `--cert-file` (Thường là `/etc/kubernetes/pki/etcd/server.crt`).
4. **Server Key**: Đường dẫn tại tham số `--key-file` (Thường là `/etc/kubernetes/pki/etcd/server.key`).

---

## 🛠️ Cú pháp lệnh Backup hoàn chỉnh

Sử dụng biến `ETCDCTL_API=3` trước lệnh để khai báo phiên bản API mới nhất của ETCD:

```bash
ETCDCTL_API=3 etcdctl \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key \
  snapshot save /opt/etcd-backup.db
```

---

## ⚠️ Các lỗi thường gặp khi Backup ETCD và cách xử lý:

### Lỗi 1: `command not found: etcdctl`
Nếu hệ thống báo không tìm thấy lệnh `etcdctl`, có thể nó chưa được cài đặt hoặc chưa nằm trong biến môi trường `$PATH`.
* **Cách sửa:** Cài đặt nhanh gói client:
  ```bash
  sudo apt-get update && sudo apt-get install -y etcd-client
  ```

### Lỗi 2: `Error:  remote connection failed: context deadline exceeded`
Lỗi này xảy ra khi endpoint bị sai (ví dụ dùng `localhost` thay vì IP cụ thể `127.0.0.1`, hoặc ngược lại).
* **Cách sửa:** Hãy kiểm tra IP bind trong file `/etc/kubernetes/manifests/etcd.yaml`. Thay thế `--endpoints=https://127.0.0.1:2379` hoặc `--endpoints=https://localhost:2379` hoặc IP của chính controlplane node.

### Lỗi 3: `Error:  permission denied`
Lỗi do không có quyền ghi vào thư mục `/opt` hoặc không có quyền đọc file chứng chỉ trong `/etc/kubernetes/pki/`.
* **Cách sửa:** Thêm `sudo` vào đầu lệnh.

---

## ✅ Xác nhận Backup thành công
Để kiểm tra file snapshot vừa tạo có toàn vẹn không, hãy chạy lệnh sau:
```bash
ETCDCTL_API=3 etcdctl --write-out=table snapshot status /opt/etcd-backup.db
```
Nếu bảng thông tin trạng thái hiển thị (bao gồm Version, Hash, Revision, Total Size), chứng tỏ file backup của bạn hoàn toàn hợp lệ!
