# Lời giải Mock Exam 3 - Câu 3: Khởi tạo StorageClass rancher-sc (6 điểm)

Bài tập này kiểm tra kỹ năng quản lý tài nguyên lưu trữ (Storage), cụ thể là tạo một `StorageClass` tùy biến sử dụng Local Path Provisioner của Rancher.

---

## 🛠️ Quy trình thực hiện (Dùng YAML)

StorageClass không thể tạo nhanh bằng lệnh gõ tắt (imperative commands). Ta bắt buộc phải viết bằng file YAML.

### Bước 1: Tạo file cấu hình `rancher-sc.yaml`
Em hãy tạo file `/tmp/rancher-sc.yaml` bằng cách chạy lệnh sau:

```bash
cat <<EOF > /tmp/rancher-sc.yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: rancher-sc
provisioner: rancher.io/local-path            # Trình cung cấp volume của Rancher
volumeBindingMode: WaitForFirstConsumer       # Chờ Pod tiêu thụ mới bind
allowVolumeExpansion: true                    # Cho phép mở rộng dung lượng
EOF
```

### Bước 2: Khởi tạo StorageClass trong cụm
```bash
kubectl apply -f /tmp/rancher-sc.yaml
```

---

## 🔍 Kiểm tra kết quả (Verification)

Kiểm tra danh sách StorageClass:
```bash
kubectl get sc rancher-sc
```

*Kết quả mong muốn:*
```text
NAME         PROVISIONER             RECLAIMPOLICY   VOLUMEBINDINGMODE      ALLOWVOLUMEEXPANSION   AGE
rancher-sc   rancher.io/local-path   Delete          WaitForFirstConsumer   true                   10s
```

*Đảm bảo các thuộc tính sau chính xác:*
* **PROVISIONER:** `rancher.io/local-path`
* **VOLUMEBINDINGMODE:** `WaitForFirstConsumer`
* **ALLOWVOLUMEEXPANSION:** `true`
