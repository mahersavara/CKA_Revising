# Chuyên đề 5: Thiết lập Sidecar Container Streaming và Trích Xuất Logs (Câu 13, 14, 27, 37, 63)

Chuyên đề này hướng dẫn bạn cách xử lý các bài tập giám sát và quản lý log (logging) trong cụm Kubernetes. Cụ thể là cách trích xuất dòng log theo từ khóa và cấu hình Sidecar container để stream log từ file trong ổ đĩa ra stdout.

---

## 🔍 1. Trích xuất Logs theo từ khóa (Câu 13, 27, 63)

Các câu hỏi này yêu cầu bạn đọc log của một Pod, lọc ra các dòng log chứa lỗi hoặc từ khóa chỉ định, rồi lưu kết quả vào một file trên máy host.

* **Câu 13:** Đọc log của pod `frontend`, tìm mẫu `"started"` và ghi vào `/opt/error-logs`.
  ```bash
  kubectl logs frontend | grep -i "started" > /opt/error-logs
  ```
* **Câu 27:** Đọc log của pod `bar`, tìm mẫu `"file-not-found"` (hoặc `"unable-to-access-website"`) và ghi vào `/opt/KUTR00101/bar`.
  ```bash
  # Tùy thuộc vào từ khóa đề bài yêu cầu:
  kubectl logs bar | grep -i "file-not-found" > /opt/KUTR00101/bar
  # hoặc:
  kubectl logs bar | grep -i "unable-to-access-website" > /opt/KUTR00101/bar
  ```
* **Câu 63:** Đọc log của pod `foo`, tìm mẫu `"unable-to-access-website"` và ghi vào `/opt/KULM00201/foo`.
  ```bash
  kubectl logs foo | grep -i "unable-to-access-website" > /opt/KULM00201/foo
  ```

*Mẹo đi thi:* Luôn kiểm tra xem thư mục đích đã tồn tại chưa bằng `mkdir -p <thư-mục>`. Đảm bảo namespace của Pod là chính xác bằng cách thêm `-n <namespace>`.

---

## 🔄 2. Cấu hình Sidecar Container để Stream Logs

Trong Kubernetes, kiến trúc logging chuẩn yêu cầu các container ghi log ra stdout/stderr để `kubectl logs` có thể thu thập. Nếu ứng dụng cũ (legacy app) ghi log ra một file trong container, ta cần chạy thêm một container phụ (**Sidecar**) dùng chung volume với container chính và chạy lệnh `tail -f` để chuyển hướng log ra stdout.

### Lớp bài toán A: Cập nhật Deployment (Câu 14)
**Đề bài:** Cập nhật Deployment `synergy-leverager` để thêm sidecar container tên `sidecar` dùng image `busybox:stable`, chạy lệnh `/bin/sh -c "tail -n+1 -f /var/log/synergy-leverager.log"`. Hai container chia sẻ ổ đĩa gắn tại thư mục `/var/log`. Không thay đổi cấu hình container chính trừ việc gắn volume.

#### Giải pháp:
1. Chạy lệnh edit trực tiếp deployment:
   ```bash
   kubectl edit deployment synergy-leverager
   ```
2. Thêm volume `emptyDir` và gắn `volumeMounts` vào cả container chính và container sidecar mới.

```yaml
spec:
  template:
    spec:
      volumes:                           # 1. Định nghĩa Volume dùng chung
      - name: shared-logs
        emptyDir: {}
      containers:
      - name: synergy-leverager          # Container chính (đã có sẵn)
        image: ...
        volumeMounts:                    # 2. Gắn volume vào container chính
        - name: shared-logs
          mountPath: /var/log
      - name: sidecar                    # 3. Thêm container sidecar mới
        image: busybox:stable
        command: ["/bin/sh", "-c", "tail -n+1 -f /var/log/synergy-leverager.log"]
        volumeMounts:                    # 4. Gắn volume vào container sidecar
        - name: shared-logs
          mountPath: /var/log
```

---

### Lớp bài toán B: Cập nhật Pod đang chạy (Câu 37 - Classic CKA Trick)
**Đề bài:** Thêm sidecar container tên `sidecar` dùng image `busybox` để stream log từ file `/var/log/big-corp-app.log` của Pod `big-corp-app`.

*Lưu ý quan trọng:* Bạn **không thể** thêm container vào một Pod đang chạy bằng lệnh `edit` trực tiếp. Bạn phải xuất cấu hình ra file YAML, chỉnh sửa, xóa Pod cũ và tạo lại Pod mới.

#### Quy trình thực hiện:
1. **Xuất YAML của Pod cũ:**
   ```bash
   kubectl get pod big-corp-app -o yaml > /tmp/big-corp-app.yaml
   ```
2. **Backup file này đề phòng:**
   ```bash
   cp /tmp/big-corp-app.yaml /tmp/big-corp-app.yaml.bak
   ```
3. **Mở file chỉnh sửa:**
   ```bash
   nano /tmp/big-corp-app.yaml
   ```
   * Thêm volume `emptyDir` tên `logs` vào `spec.volumes` (nếu chưa có).
   * Gắn `volumeMounts` vào container chính `big-corp-app` tại mountPath `/var/log`.
   * Thêm container `sidecar` bên dưới `spec.containers`:
     ```yaml
     - name: sidecar
       image: busybox
       args: [/bin/sh, -c, 'tail -n+1 -f /var/log/big-corp-app.log']
       volumeMounts:
       - name: logs
         mountPath: /var/log
     ```
4. **Xóa Pod cũ ngay lập tức:**
   ```bash
   kubectl delete pod big-corp-app --grace-period=0 --force
   ```
5. **Tạo lại Pod từ file YAML mới chỉnh sửa:**
   ```bash
   kubectl apply -f /tmp/big-corp-app.yaml
   ```
6. **Kiểm tra xem sidecar có hoạt động tốt không:**
   ```bash
   kubectl logs big-corp-app -c sidecar
   ```
   Lệnh này sẽ hiển thị logs được stream từ file `big-corp-app.log` ra stdout của sidecar.
