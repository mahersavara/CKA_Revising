# Chuyên đề 2: Tạo Pod và Namespace Cơ Bản (Câu 2, 23, 42, 43, 73)

Chuyên đề này hướng dẫn các thao tác cơ bản nhất khi đi thi CKA: Tạo Namespace, chạy Pod đơn container với các tùy biến (Image, Label, Command/Args), và quản lý việc xóa Pod.

---

## 📋 Tóm tắt các yêu cầu từ đề thi

1. **Câu 2:** Tạo namespace `development` và chạy một Pod tên `nginx` sử dụng image `nginx` trong namespace đó.
2. **Câu 23:** Tạo một Pod tên `nginx` với label `env=test` trong namespace `engineering`.
3. **Câu 43:** Tạo một Pod chạy image `busybox` thực thi lệnh `sleep 3600`.
4. **Câu 73:** Tạo namespace mới tên `my-website` và chạy một Pod tên `mongo` dùng image `mongo` trong namespace đó.
5. **Câu 42:** Liệt kê các Pod tên `nginx-dev` và `nginx-prod` rồi xóa chúng đi.

---

## 🛠️ Quy trình thực hiện & Lệnh mẫu

### 1. Tạo Namespace mới
Trước khi tạo bất kỳ tài nguyên nào trong một namespace mới, bạn bắt buộc phải tạo namespace đó trước:
```bash
kubectl create namespace development
kubectl create namespace engineering
kubectl create namespace my-website
```

### 2. Chạy Pod cơ bản với `kubectl run` (Imperative Commands)
Sử dụng cờ `--restart=Never` để đảm bảo tài nguyên tạo ra là Pod đơn chứ không phải Deployment hay Job (trong các phiên bản Kubernetes mới, `kubectl run` mặc định chỉ tạo Pod nên cờ này có thể lược bỏ, nhưng viết vào vẫn an toàn).

#### Chạy Pod nginx trong namespace `development` (Câu 2):
```bash
kubectl run nginx --image=nginx -n development
```

#### Chạy Pod nginx có Label `env=test` trong namespace `engineering` (Câu 23):
```bash
kubectl run nginx --image=nginx --labels="env=test" -n engineering
```

#### Chạy Pod mongo trong namespace `my-website` (Câu 73):
```bash
kubectl run mongo --image=mongo -n my-website
```

#### Chạy Pod busybox với lệnh thực thi `sleep 3600` (Câu 43):
Để truyền lệnh (command) cho Pod, hãy viết lệnh đó phía sau ký tự `--` ở cuối câu lệnh `kubectl run`:
```bash
kubectl run busybox --image=busybox --restart=Never -- sh -c "sleep 3600"
```
*(Nếu đề thi yêu cầu cụ thể tham số args hay command, bạn có thể xuất YAML bằng `--dry-run=client -o yaml` để điều chỉnh chính xác cấu trúc `command` hoặc `args` nếu cần).*

---

### 3. Tìm và Xóa Pod cụ thể (Câu 42)

#### Liệt kê các Pod có tên cụ thể trong toàn bộ cluster:
```bash
kubectl get pods -A | grep -E "nginx-dev|nginx-prod"
```

#### Xóa nhanh các Pod đó mà không cần chờ đợi lâu (sử dụng cờ `--grace-period=0 --force`):
```bash
kubectl delete pod nginx-dev nginx-prod --n <namespace_cua_pod> --grace-period=0 --force
```
*Lưu ý:* Cần kiểm tra xem hai Pod đó đang nằm ở namespace nào để chỉ định `-n` chính xác khi xóa. Nếu chúng nằm ở các namespace khác nhau, hãy chạy 2 lệnh xóa riêng biệt:
```bash
kubectl delete pod nginx-dev -n <namespace-1>
kubectl delete pod nginx-prod -n <namespace-2>
```

---

## 🔍 Kiểm tra kết quả (Verification)

### 1. Kiểm tra Namespace đã được tạo chưa:
```bash
kubectl get ns
```

### 2. Kiểm tra trạng thái chạy của Pod và Labels đi kèm:
```bash
kubectl get pods -n engineering --show-labels
```
*Kết quả mong muốn:* Pod `nginx` ở trạng thái `Running` và có label `env=test`.

### 3. Kiểm tra xem Pod busybox có đang thực thi lệnh sleep không:
```bash
kubectl get pod busybox -o jsonpath='{.spec.containers[0].command}'
# Hoặc:
kubectl get pod busybox -o jsonpath='{.spec.containers[0].args}'
```

---

## ⚠️ Lưu ý phòng thi
* **Namespace:** Đây là lỗi mất điểm phổ biến nhất. Luôn chỉ định cờ `-n <namespace>` khi chạy hoặc xóa tài nguyên.
* **Tên Pod:** Phải trùng khớp 100% với yêu cầu đề bài (ví dụ `nginx` khác `nginx-pod`).
* **Lọc trước khi xóa:** Khi thực hiện xóa Pod, hãy chắc chắn bạn đã chạy lệnh `kubectl get po -A` để biết chính xác namespace của các Pod cần xóa.
