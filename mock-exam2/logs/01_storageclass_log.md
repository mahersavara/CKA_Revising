# Nhật ký Thực hành Mock Exam 2 - Câu 1: Cấu hình StorageClass Mặc định

Tài liệu này lưu trữ quá trình khởi tạo và thiết lập StorageClass mặc định `local-sc` thành công.

---

## 💻 Các lệnh đã thực thi

1. **Khởi tạo file cấu hình `/tmp/local-sc.yaml`:**
   ```bash
   cat <<EOF > /tmp/local-sc.yaml
   apiVersion: storage.k8s.io/v1
   kind: StorageClass
   metadata:
     name: local-sc
     annotations:
       storageclass.kubernetes.io/is-default-class: "true"
   provisioner: kubernetes.io/no-provisioner
   volumeBindingMode: WaitForFirstConsumer
   allowVolumeExpansion: true
   EOF
   ```

2. **Apply cấu hình:**
   ```bash
   kubectl apply -f /tmp/local-sc.yaml
   ```
   *Output:* `storageclass.storage.k8s.io/local-sc created`

3. **Kiểm tra trạng thái StorageClass:**
   ```bash
   kubectl get sc
   ```
   *Output thực tế mong muốn:*
   ```text
   NAME                 PROVISIONER                    RECLAIMPOLICY   VOLUMEBINDINGMODE      ALLOWVOLUMEEXPANSION   AGE
   local-sc (default)   kubernetes.io/no-provisioner   Delete          WaitForFirstConsumer   true                   20s
   ```
   *(Nhận xét: StorageClass đã được thiết lập mặc định thành công với các thuộc tính WaitForFirstConsumer và cho phép mở rộng dung lượng).*
