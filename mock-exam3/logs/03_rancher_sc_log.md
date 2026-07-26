# Nhật ký Thực hành Mock Exam 3 - Câu 3: Khởi tạo StorageClass rancher-sc

Tài liệu này lưu trữ quá trình khởi tạo StorageClass `rancher-sc` thành công trên cụm.

---

## 💻 Các lệnh đã thực thi

1. **Khởi tạo file cấu hình `/tmp/rancher-sc.yaml`:**
   ```bash
   cat <<EOF > /tmp/rancher-sc.yaml
   apiVersion: storage.k8s.io/v1
   kind: StorageClass
   metadata:
     name: rancher-sc
   provisioner: rancher.io/local-path
   volumeBindingMode: WaitForFirstConsumer
   allowVolumeExpansion: true
   EOF
   ```

2. **Apply cấu hình:**
   ```bash
   kubectl apply -f /tmp/rancher-sc.yaml
   ```
   *Output:* `storageclass.storage.k8s.io/rancher-sc created`

3. **Kiểm tra trạng thái StorageClass:**
   ```bash
   kubectl get sc rancher-sc
   ```
   *Output thực tế:*
   ```text
   NAME         PROVISIONER             RECLAIMPOLICY   VOLUMEBINDINGMODE      ALLOWVOLUMEEXPANSION   AGE
   rancher-sc   rancher.io/local-path   Delete          WaitForFirstConsumer   true                   20s
   ```
   *(Nhận xét: StorageClass đã được khởi tạo thành công với các tham số đúng yêu cầu của đề).*
