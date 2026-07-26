# Nhật ký Thực hành: Backup ETCD trên Node `controlplane`

Tài liệu này lưu trữ quá trình thực hiện lệnh backup ETCD trên cụm lab KodeKloud.

---

## 💻 Các lệnh đã thực thi

1. **Xem thông tin cấu hình ETCD để lấy thông số TLS và Endpoint:**
   ```bash
   cat /etc/kubernetes/manifests/etcd.yaml
   ```

2. **Thực thi lệnh sao lưu ETCD dạng Snapshot:**
   ```bash
   ETCDCTL_API=3 etcdctl \
     --endpoints=https://127.0.0.1:2379 \
     --cacert=/etc/kubernetes/pki/etcd/ca.crt \
     --cert=/etc/kubernetes/pki/etcd/server.crt \
     --key=/etc/kubernetes/pki/etcd/server.key \
     snapshot save /opt/etcd-backup.db
   ```

3. **Output mong muốn khi chạy thành công:**
   ```text
   Snapshot saved at /opt/etcd-backup.db
   ```

4. **Kiểm tra trạng thái file Backup:**
   ```bash
   ETCDCTL_API=3 etcdctl --write-out=table snapshot status /opt/etcd-backup.db
   ```
   *Output:*
   ```text
   +----------+----------+------------+------------+
   |   HASH   | REVISION | TOTAL KEYS | TOTAL SIZE |
   +----------+----------+------------+------------+
   | c102a0df |     4321 |       1245 |     2.1 MB |
   +----------+----------+------------+------------+
   ```
