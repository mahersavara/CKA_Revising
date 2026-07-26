# Chuyên đề 14: Lập Lịch Pod - NodeSelector và Pod Priority (Câu 28, 34, 68)

Chuyên đề này hướng dẫn các kỹ thuật định hướng lập lịch cho Pod chạy trên các Node mong muốn bằng **NodeSelector** và cấu hình độ ưu tiên lập lịch cho Pod sử dụng **PriorityClass**.

---

## 📍 1. Chỉ định Node chạy Pod bằng NodeSelector (Câu 34, 68)

**Đề bài:** Tạo một Pod tên `nginx-kusc00401` (hoặc `nginx-kusc00101`) sử dụng image `nginx`, cấu hình lập lịch chỉ chạy trên Node có nhãn `disk=ssd`.

**Giải pháp:**
1. Tạo trước file YAML mẫu:
   ```bash
   kubectl run nginx-kusc00401 --image=nginx --dry-run=client -o yaml > pod.yaml
   ```
2. Mở file chỉnh sửa và thêm trường `nodeSelector` vào phần `spec`:
   ```yaml
   apiVersion: v1
   kind: Pod
   metadata:
     name: nginx-kusc00401
   spec:
     containers:
     - name: nginx
       image: nginx
     nodeSelector:                  # 👈 Định hướng lập lịch
       disk: ssd                    # Khớp với nhãn "disk=ssd" trên Node
   ```
3. Chạy lệnh tạo Pod:
   ```bash
   kubectl apply -f pod.yaml
   ```

*⚠️ Cảnh báo lỗi của đề SurePass:*
Trong đáp án giải thích của Câu 34 (trang 38), file YAML ghi `disk: spinning`. Đây là lỗi sao chép của đề thi. Đi thi thực tế, nếu đề bài ghi **`disk=ssd`**, bạn bắt buộc phải ghi cấu hình là `disk: ssd`.

---

## ⚡ 2. Cấu hình Pod Priority & PriorityClass (Câu 28)

**Pod Priority** cho phép gán độ ưu tiên lập lịch cho Pod. Khi hệ thống thiếu tài nguyên, Pod có độ ưu tiên cao sẽ được lập lịch trước và có thể trục xuất (preempt) các Pod có độ ưu tiên thấp hơn.

### Đề bài yêu cầu:
1. Tìm PriorityClass tự định nghĩa (user-defined) có giá trị cao nhất hiện tại.
2. Tạo một PriorityClass mới tên `high-priority` với giá trị thấp hơn giá trị cao nhất kia 1 đơn vị (`value = highest_value - 1`).
3. Patch Deployment `busybox-logger` trong namespace `priority` để sử dụng PriorityClass mới này.

---

### Quy trình thực hiện:

#### Bước 1: Tìm PriorityClass hiện có
Chạy lệnh hiển thị danh sách PriorityClass trong cụm:
```bash
kubectl get priorityclasses
# Hoặc viết tắt:
kubectl get pc
```
*Ví dụ kết quả:*
```text
NAME             VALUE     GLOBALDEFAULT   AGE
default-low      1000      false           10d
mid-tier         2000      false           7d
critical-pods    1000000   true            30d
```
*Phân tích:*
* `critical-pods` là PriorityClass hệ thống (system-defined / system-cluster-critical có giá trị rất lớn, thường bắt đầu bằng `system-*` hoặc được dùng mặc định của hệ thống). Bạn cần loại trừ các class hệ thống này ra.
* Lọc các class do người dùng tạo (`user-defined`), ở đây là `default-low` (1000) và `mid-tier` (2000).
* Giá trị cao nhất do người dùng định nghĩa là **2000** (`mid-tier`).
* Vậy giá trị của class mới `high-priority` phải là: `2000 - 1 = 1999`.

#### Bước 2: Tạo PriorityClass mới `high-priority.yaml`
```yaml
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
  name: high-priority
value: 1999                          # 👈 Giá trị tính toán được (2000 - 1)
globalDefault: false
description: "High priority class for user workloads"
```
*Lệnh tạo:* `kubectl apply -f high-priority.yaml`

#### Bước 3: Patch Deployment `busybox-logger`
Để gán PriorityClass vào Deployment mà không cần viết lại toàn bộ YAML, sử dụng lệnh `kubectl patch` ở định dạng merge JSON:
```bash
kubectl patch deployment busybox-logger \
  -n priority \
  --type='merge' \
  -p '{"spec": {"template": {"spec": {"priorityClassName": "high-priority"}}}}'
```

---

## 🔍 Kiểm tra kết quả (Verification)

### 1. Xác nhận PriorityClass đã được áp dụng vào Deployment:
```bash
kubectl get deployment busybox-logger -n priority -o jsonpath='{.spec.template.spec.priorityClassName}'
```
*Kết quả mong muốn:* `high-priority`.

### 2. Xác nhận Pod tạo ra cũng thừa hưởng cấu hình này:
```bash
kubectl get pods -n priority -l app=busybox-logger -o jsonpath='{.items[*].spec.priorityClassName}'
```
*(Nếu Pod hiển thị `high-priority` tức là cấu hình hoạt động chính xác).*
