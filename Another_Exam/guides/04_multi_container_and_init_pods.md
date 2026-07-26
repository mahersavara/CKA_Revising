# Chuyên đề 4: Thiết lập Multi-container và Init-container Pods (Câu 10, 16, 35, 36, 48, 71, 80, 83)

Chuyên đề này hướng dẫn bạn cách viết YAML để tạo Pod có nhiều container chạy song song (Multi-container Pods), cách cấu hình Init container chạy trước để chuẩn bị môi trường, và cách chạy Pod dùng một lần tự xóa sau khi chạy xong.

---

## 📦 1. Tạo Multi-container Pod (Câu 16, 48, 71, 80, 83)

**Mẹo làm bài thi:** Bạn không thể dùng lệnh gõ nhanh để tạo pod nhiều container trực tiếp. Bạn phải tạo trước 1 file template YAML từ 1 container, sau đó copy-paste để tạo container thứ 2, thứ 3...

### Bước 1: Tạo file cấu hình mẫu dùng `dry-run`
```bash
kubectl run kucc1 --image=nginx --dry-run=client -o yaml > multi-container.yaml
```

### Bước 2: Chỉnh sửa file `multi-container.yaml`
Mở file và thêm định nghĩa các container khác vào dưới mục `spec.containers`. Hãy chú ý căn lề thụt đầu dòng (indentation) thật chính xác:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: kucc1
spec:
  containers:
  - name: nginx-container         # Container thứ nhất
    image: nginx
  - name: consul-container        # Container thứ hai
    image: consul
  restartPolicy: Always
```

*Lưu ý từ đề thi:*
* **Câu 16:** Pod tên `kucc1` gồm 2 container: `redis` và `memcached`.
* **Câu 71:** Pod tên `kucc1` gồm 2 container: `nginx` và `consul`.
* **Câu 80:** Pod tên `multi-container` gồm 3 container: `nginx-container` (image `nginx`), `redis-container` (image `redis`), `consul-container` (image `consul`).
* **Câu 48 & 83:** Pod tên `kucc8` gồm 3 container (nginx, redis, memcached) hoặc 4 container (nginx, redis, memcached, consul).

---

## ⏳ 2. Thiết lập Init Container (Câu 36)

Init Container là container chạy và hoàn thành trước khi container chính khởi động. Chúng thường dùng để chuẩn bị dữ liệu hoặc chờ dịch vụ khác sẵn sàng.

**Bài toán:** Cập nhật file cấu hình `/opt/KUCC00108/pod-spec-KUCC00108.yaml` của Pod `hungry-bear` để thêm một init container tạo file `/workdir/calm.txt`. Nếu không có file này, container chính (`checker`) sẽ bị lỗi và thoát.

### Cấu trúc YAML chỉnh sửa (`/opt/KUCC00108/pod-spec-KUCC00108.yaml`):

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: hungry-bear
spec:
  volumes:
  - name: workdir
    emptyDir: {}
  containers:
  - name: checker
    image: alpine
    command: ["/bin/sh", "-c", "if [ -f /workdir/calm.txt ]; then sleep 100000; else exit 1; fi"]
    volumeMounts:
    - name: workdir
      mountPath: /workdir
  initContainers:                    # 👈 Thêm phần initContainers tại đây
  - name: create
    image: alpine
    command: ["/bin/sh", "-c", "touch /workdir/calm.txt"]
    volumeMounts:
    - name: workdir
      mountPath: /workdir
```
Chạy lệnh apply để tạo Pod:
```bash
kubectl apply -f /opt/KUCC00108/pod-spec-KUCC00108.yaml
```

---

## ⚡ 3. Chạy Pod tự động xóa khi hoàn thành (Câu 35)

**Đề bài:** Chạy một Pod dùng image `busybox` in ra dòng chữ `"hello world"` rồi tự động xóa ngay sau khi chạy xong.

**Giải pháp:** Sử dụng cờ `--rm` kết hợp chế độ tương tác `-it` và `--restart=Never`:
```bash
kubectl run busybox --image=busybox -it --rm --restart=Never -- /bin/sh -c 'echo "hello world"'
```
*Giải thích:* 
* `--rm`: Tự động xóa Pod trên API server ngay sau khi container chạy xong và trả về output.
* `-it`: Chạy ở chế độ tương tác (interactive) để xem trực tiếp output ra màn hình.

---

## 🖥️ 4. Chạy lệnh `env` từ Pod và lưu ra file (Câu 10)

**Đề bài:** Tạo một Pod busybox chạy lệnh `env` và lưu kết quả vào file `envpod` trên máy host.

*Lưu ý:* Đáp án trong đề thi SurePass bị nhầm lẫn hiển thị file `ingress.yaml`. Bạn nên giải chính xác bằng cách chạy Pod tạm thời in ra biến môi trường và ghi thẳng output vào file:

```bash
kubectl run busybox --image=busybox -it --rm --restart=Never -- env > envpod
```
Hoặc tạo Pod chạy ngầm rồi dùng `exec` để lấy thông tin:
```bash
kubectl run busybox --image=busybox --restart=Never -- sleep 3600
# Chờ pod running rồi chạy:
kubectl exec busybox -- env > envpod
# Xóa pod:
kubectl delete pod busybox
```
*(Cách thứ nhất dùng `--rm` là nhanh nhất và đúng chuẩn CKA nhất).*
