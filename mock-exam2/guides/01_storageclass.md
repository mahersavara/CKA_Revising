# Lời giải Mock Exam 2 - Câu 1: Cấu hình StorageClass Mặc định (6 điểm)

Bài tập này kiểm tra kỹ năng quản lý tài nguyên lưu trữ (Storage), cụ thể là tạo một `StorageClass` tùy biến và cấu hình nó làm StorageClass mặc định của toàn cụm Kubernetes.

---

## 🛠️ Quy trình thực hiện (Dùng YAML)

StorageClass không thể tạo nhanh bằng lệnh gõ tắt (imperative commands). Ta bắt buộc phải viết bằng file YAML.

### Bước 1: Tạo file cấu hình `local-sc.yaml`
Em hãy tạo file `/tmp/local-sc.yaml` bằng cách chạy lệnh sau:

```bash
cat <<EOF > /tmp/local-sc.yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: local-sc
  annotations:
    # 👈 Cấu hình làm StorageClass mặc định cho cụm
    storageclass.kubernetes.io/is-default-class: "true"
provisioner: kubernetes.io/no-provisioner       # Trình cung cấp volume
volumeBindingMode: WaitForFirstConsumer         # Chờ Pod tiêu thụ mới bind
allowVolumeExpansion: true                      # Cho phép mở rộng dung lượng
EOF
```

### Bước 2: Khởi tạo StorageClass trong cụm
```bash
kubectl apply -f /tmp/local-sc.yaml
```

---

## 🔍 Kiểm tra kết quả (Verification)

### 1. Kiểm tra danh sách StorageClass:
```bash
kubectl get sc
```
*Kết quả mong muốn:*
```text
NAME                 PROVISIONER                    RECLAIMPOLICY   VOLUMEBINDINGMODE      ALLOWVOLUMEEXPANSION   AGE
local-sc (default)   kubernetes.io/no-provisioner   Delete          WaitForFirstConsumer   true                   10s
```
*Yêu cầu kiểm tra:*
* Cạnh tên `local-sc` phải có chữ **`(default)`**.
* Cột `VOLUMEBINDINGMODE` là `WaitForFirstConsumer`.
* Cột `ALLOWVOLUMEEXPANSION` là `true`.

### ⚠️ Lưu ý phòng thi:
Nếu trong cụm **đã có sẵn một StorageClass mặc định khác**, việc set `local-sc` làm mặc định sẽ khiến cụm có 2 default StorageClass. Em nên tắt chế độ mặc định của StorageClass cũ bằng lệnh sau (nếu cần):
```bash
kubectl patch storageclass <tên-sc-cũ> -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"false"}}}'
```
*(Nếu cụm chưa có default SC nào, em có thể bỏ qua bước này).*
