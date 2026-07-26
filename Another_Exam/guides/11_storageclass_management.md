# Chuyên đề 11: Tạo và Thiết Lập StorageClass Mặc Định (Câu 22)

StorageClass (SC) cho phép tự động phân phối ổ đĩa (Dynamic Provisioning) cho các PVC. Bài tập này yêu cầu bạn tạo một StorageClass tùy biến từ một provisioner sẵn có, cấu hình chế độ liên kết trễ và đặt nó làm StorageClass mặc định của cụm.

---

## 🛠️ Quy trình thực hiện từng bước

### Bước 1: Tạo file cấu hình `local-path-sc.yaml`
Bạn cần tạo một file YAML cấu hình tài nguyên StorageClass. Chạy lệnh sau để tạo file:

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: local-path
  annotations:
    # 👈 Đánh dấu đây là StorageClass mặc định cho cụm
    storageclass.kubernetes.io/is-default-class: "true"
provisioner: rancher.io/local-path           # Trình cung cấp (do đề bài chỉ định)
volumeBindingMode: WaitForFirstConsumer     # Chờ cho đến khi Pod tiêu thụ được tạo mới bind volume
```

*Lưu ý từ khóa đề bài:*
* Tên: `local-path`
* Provisioner: `rancher.io/local-path`
* Volume Binding Mode: `WaitForFirstConsumer`
* Đặt làm mặc định: Cần annotation `storageclass.kubernetes.io/is-default-class: "true"`.

Áp dụng file cấu hình vào cụm:
```bash
kubectl apply -f local-path-sc.yaml
```

---

### Bước 2: Loại bỏ StorageClass mặc định cũ (nếu có)
Nếu trong cụm hiện tại đã có sẵn một StorageClass mặc định khác (ví dụ: `standard`), việc bạn cấu hình thêm `local-path` làm mặc định sẽ khiến cụm có 2 StorageClass mặc định. Điều này sẽ báo lỗi khi tạo PVC tự động.

Hãy chạy lệnh sau để kiểm tra:
```bash
kubectl get sc
```

Nếu thấy có StorageClass khác có ký hiệu `(default)`, bạn hãy xóa chế độ mặc định của nó bằng lệnh sau:
```bash
kubectl patch storageclass <tên-sc-cũ> -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"false"}}}'
```

---

## 🔍 Kiểm tra kết quả (Verification)

Kiểm tra danh sách các StorageClass:
```bash
kubectl get storageclass
```
*Kết quả mong muốn:*
```text
NAME                   PROVISIONER             RECLAIMPOLICY   VOLUMEBINDINGMODE      ALLOWVOLUMEEXPANSION   AGE
local-path (default)   rancher.io/local-path   Delete          WaitForFirstConsumer   false                  10s
```
*Yêu cầu kiểm tra:*
* Cạnh tên `local-path` phải xuất hiện chữ **`(default)`**.
* Cột `VOLUMEBINDINGMODE` có giá trị là `WaitForFirstConsumer`.
