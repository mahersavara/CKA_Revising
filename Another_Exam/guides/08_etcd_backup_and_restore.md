# Chuyên đề 8: Sao Lưu và Phục Hồi Dữ Liệu ETCD (Câu 52, 75)

ETCD là cơ sở dữ liệu lưu trữ toàn bộ trạng thái của cụm Kubernetes. Việc sao lưu (backup) và phục hồi (restore) ETCD là một trong những bài toán quan trọng nhất trong kỳ thi CKA.

---

## 🔑 Các tham số TLS Certs cần thiết
Để giao tiếp với ETCD qua `etcdctl`, bạn bắt buộc phải chỉ định 3 file chứng chỉ bảo mật:
1. **CA Certificate:** `--cacert`
2. **Client Certificate:** `--cert`
3. **Client Private Key:** `--key`

*Mẹo đi thi:* Đi thi đề bài sẽ cho sẵn đường dẫn đến các file này. Bạn có thể tìm thấy chúng trong file cấu hình `/etc/kubernetes/manifests/etcd.yaml` trên Master Node.

---

## 🛠️ Quy trình thực hiện

### Phần 1: Sao lưu ETCD (Snapshot Save)

Sử dụng biến môi trường `ETCDCTL_API=3` trước lệnh chạy để dùng phiên bản API mới nhất.

#### Câu lệnh mẫu (Câu 52):
```bash
ETCDCTL_API=3 etcdctl --endpoints=https://127.0.0.1:2379 \
  --cacert=/opt/KUCM00302/ca.crt \
  --cert=/opt/KUCM00302/etcd-client.crt \
  --key=/opt/KUCM00302/etcd-client.key \
  snapshot save /srv/data/etcd-snapshot.db
```
*(Nếu đường dẫn key có chữ T ở đầu như trong OCR `Topt/...`, đó có thể là lỗi chính tả của đề thi, hãy sửa thành `/opt/...` cho đúng thực tế).*

#### Câu lệnh mẫu (Câu 75):
```bash
ETCDCTL_API=3 etcdctl --endpoints=https://127.0.0.1:2379 \
  --cacert=/opt/KUIN00601/ca.crt \
  --cert=/opt/KUIN00601/etcd-client.crt \
  --key=/opt/KUIN00601/etcd-client.key \
  snapshot save /srv/data/etcd-snapshot.db
```

---

### Phần 2: Phục hồi ETCD từ file Snapshot có sẵn (Snapshot Restore)

Khi phục hồi, chúng ta sẽ khôi phục dữ liệu ra một thư mục mới (ví dụ `/var/lib/etcd-backup`) để tránh xung đột với dữ liệu hiện tại, sau đó cập nhật file cấu hình tĩnh của ETCD Pod để trỏ vào thư mục dữ liệu mới này.

#### Bước 1: Chạy lệnh Restore (Câu 75)
Khôi phục dữ liệu từ file `/var/lib/backup/etcd-snapshot-previous.db`:
```bash
ETCDCTL_API=3 etcdctl \
  --data-dir=/var/lib/etcd-backup \
  snapshot restore /var/lib/backup/etcd-snapshot-previous.db
```
*Lưu ý:* Khi chạy lệnh restore, ta không bắt buộc phải truyền certs (vì đây là thao tác ghi file local ngoại tuyến), nhưng nếu đề bài yêu cầu bảo mật nghiêm ngặt hoặc lệnh bị lỗi, bạn hãy truyền đủ các tham số certs như sau:
```bash
ETCDCTL_API=3 etcdctl --endpoints=https://127.0.0.1:2379 \
  --cacert=/opt/KUIN00601/ca.crt \
  --cert=/opt/KUIN00601/etcd-client.crt \
  --key=/opt/KUIN00601/etcd-client.key \
  --data-dir=/var/lib/etcd-backup \
  snapshot restore /var/lib/backup/etcd-snapshot-previous.db
```

#### Bước 2: Cập nhật đường dẫn lưu trữ trong Static Pod Manifest
Mở file `/etc/kubernetes/manifests/etcd.yaml`:
```bash
sudo nano /etc/kubernetes/manifests/etcd.yaml
```

Tìm phần cấu hình `volumes` và `volumeMounts` trỏ đến thư mục dữ liệu cũ (`/var/lib/etcd`) và sửa thành thư mục mới `/var/lib/etcd-backup`:

```yaml
# 1. Tìm trong mục container command / arguments và sửa tham số --data-dir:
spec:
  containers:
  - command:
    - etcd
    - --data-dir=/var/lib/etcd-backup    # 👈 Sửa ở đây
    ...
    volumeMounts:
    - mountPath: /var/lib/etcd-backup    # 👈 Sửa ở đây
      name: etcd-data
  ...
  volumes:
  - name: etcd-data
    hostPath:
      path: /var/lib/etcd-backup         # 👈 Sửa đường dẫn thực tế trên Host
      type: DirectoryOrCreate
```

#### Bước 3: Đợi ETCD restart và xác nhận
Kubelet sẽ tự động quét thấy thay đổi trong `/etc/kubernetes/manifests/etcd.yaml` và khởi động lại Pod ETCD.
Bạn kiểm tra xem hệ thống đã hoạt động trở lại chưa:
```bash
kubectl get pods -n kube-system
kubectl get nodes
```

---

## 🔍 Kiểm tra kết quả (Verification)
Để kiểm tra xem file backup đã được tạo thành công chưa, bạn chạy lệnh:
```bash
ETCDCTL_API=3 etcdctl --write-out=table snapshot status /srv/data/etcd-snapshot.db
```
Nếu màn hình in ra bảng thông số chứa: **Hash**, **Revision**, **Total Keys** và **Total Size** thì file snapshot của bạn hoàn toàn hợp lệ.
