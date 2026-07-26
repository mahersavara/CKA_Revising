# Chuyên đề 15: Static Pods và DaemonSets (Câu 64, 65)

Chuyên đề này hướng dẫn các thao tác quản lý hai loại tài nguyên lập lịch đặc biệt trong Kubernetes: **Static Pods** (Pod chạy độc lập không qua API Server do Kubelet quản lý) và **DaemonSets** (Đảm bảo chạy duy nhất 1 bản sao Pod trên mỗi Node).

---

## 🖥️ 1. Cấu hình Static Pod trên Worker Node (Câu 64)

**Static Pod** được quản lý trực tiếp bởi tiến trình `kubelet` trên một Node cụ thể bằng cách đọc các file manifest trong một thư mục chỉ định trên local (thường là `/etc/kubernetes/manifests`).

### Đề bài yêu cầu:
Cấu hình Kubelet trên Node `wk8s-node-1` để tự động chạy một Pod tên `webtool` dùng image `httpd` dưới dạng Static Pod.

### Quy trình thực hiện:

#### Bước 1: SSH vào Worker Node đích
```bash
ssh wk8s-node-1
# Chuyển sang quyền root
sudo -i
```

#### Bước 2: Xác định thư mục Static Pod Path của Kubelet
Đọc file cấu hình của Kubelet để tìm đường dẫn thư mục manifest (thường cấu hình ở dòng `staticPodPath`):
```bash
cat /var/lib/kubelet/config.yaml | grep -i staticPodPath
```
*Kết quả thông thường:* `staticPodPath: /etc/kubernetes/manifests`

#### Bước 3: Tạo file manifest cho Static Pod
Di chuyển vào thư mục static pod manifest đã tìm thấy:
```bash
cd /etc/kubernetes/manifests
```
Tạo file cấu hình `webtool.yaml` (do trên worker node thường không có quyền truy cập kubectl, ta tự soạn thảo file YAML thô):
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: webtool
spec:
  containers:
  - name: webtool
    image: httpd
```
Lưu lại file và thoát ra. Kubelet sẽ tự động phát hiện file mới và khởi chạy Pod `webtool-wk8s-node-1`.

#### Bước 4: Thoát khỏi Node và kiểm tra
```bash
exit   # Thoát quyền root
exit   # Thoát SSH
```
Tại máy host, kiểm tra xem Pod đã chạy chưa:
```bash
kubectl get pods -o wide | grep webtool
```
*Kết quả mong muốn:* Pod hiển thị trạng thái `Running` trên node `wk8s-node-1` với tên tự động ghép đuôi Node: `webtool-wk8s-node-1`.

---

## 🔄 2. Tạo DaemonSet chạy trên mọi Node (Câu 65)

**DaemonSet** đảm bảo tất cả (hoặc một số) Node đều chạy một bản sao của Pod. Khi có Node mới thêm vào cụm, Pod sẽ tự động được lập lịch lên đó.

### Đề bài yêu cầu:
Tạo một DaemonSet tên `ds-kusc00201` chạy image `nginx` trên **tất cả** các Node (bao gồm cả Master Node). Không được thay đổi hay ghi đè các taints sẵn có của cụm.

### Phân tích kỹ thuật:
Để DaemonSet có thể chạy được trên cả Master Node (vốn bị gán các taints chặn lập lịch như `node-role.kubernetes.io/master:NoSchedule`), ta bắt buộc phải cấu hình thêm phần **Tolerations** chấp nhận các taint này trong spec của Pod Template.

### File YAML cấu hình DaemonSet (`daemonset.yaml`):
```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: ds-kusc00201                 # 👈 Tên DaemonSet
  namespace: default
spec:
  selector:
    matchLabels:
      app: nginx-ds
  template:
    metadata:
      labels:
        app: nginx-ds
    spec:
      tolerations:                   # 👈 Cấu hình Tolerations để chạy trên Master Node
      - key: node-role.kubernetes.io/master
        effect: NoSchedule
      - key: node-role.kubernetes.io/control-plane
        effect: NoSchedule
      containers:
      - name: nginx
        image: nginx                 # 👈 Sử dụng image nginx làm tên và image chạy
```
*Lệnh tạo:* `kubectl apply -f daemonset.yaml`

---

## 🔍 Kiểm tra kết quả (Verification)
Kiểm tra danh sách các Pod được tạo ra bởi DaemonSet:
```bash
kubectl get pods -o wide | grep ds-kusc00201
```
*Kết quả mong muốn:* Số lượng Pod tạo ra phải bằng đúng tổng số Node của cụm (bao gồm cả Master và các Worker nodes), trạng thái tất cả đều là `Running`.
```bash
kubectl get ds ds-kusc00201
```
* Cột `DESIRED`, `CURRENT`, `READY` phải bằng đúng số lượng Node trong cụm.
