# Chuyên đề 6: Bảo Trì Node - Cordon & Drain (Câu 53, 78)

Bài tập này yêu cầu bạn rút một Node ra khỏi hoạt động của cụm (chuyển sang trạng thái không sẵn sàng lập lịch) và chuyển toàn bộ các Pod đang chạy trên Node đó sang các Node khác (Reschedule/Eviction) một cách an toàn.

---

## 📋 Phân tích khái niệm: Cordon vs Drain

Trong Kubernetes, khi cần bảo trì Node (ví dụ: nâng cấp hệ điều hành, bảo trì phần cứng), ta thực hiện 2 bước:

1. **Cordon (Đóng băng):** Đánh dấu Node đó là **Unschedulable**. Không cho phép bất kỳ Pod mới nào được lập lịch chạy trên Node này nữa. Các Pod hiện tại vẫn tiếp tục chạy bình thường.
2. **Drain (Trục xuất):** Kết hợp Cordon và trục xuất (evict) toàn bộ Pod hiện tại trên Node đó. Các Pod này sẽ tự động được ReplicaSet/Deployment tạo lại trên các Node khác còn trống.

---

## 🛠️ Quy trình thực hiện từng bước (Node `ek8s-node-1`)

### Bước 1: Đánh dấu Node không lập lịch (Cordon)
Chạy lệnh cordon để đánh dấu Node `ek8s-node-1`:
```bash
kubectl cordon ek8s-node-1
```

### Bước 2: Trục xuất các Pod đang chạy (Drain)
Để trục xuất toàn bộ Pod chạy trên `ek8s-node-1` sang các Node khác, ta chạy lệnh `kubectl drain`.

Tuy nhiên, trong thực tế sẽ có các rào cản ngăn cản việc drain (ví dụ: các Pod thuộc DaemonSet, Pod sử dụng Local Storage/emptyDir). Vì vậy, bạn bắt buộc phải truyền thêm các cờ bỏ qua:
```bash
kubectl drain ek8s-node-1 --delete-emptydir-data --ignore-daemonsets --force
```

*Giải thích các cờ bắt buộc:*
* `--ignore-daemonsets`: Bỏ qua các Pod được quản lý bởi DaemonSet (ví dụ kube-proxy, CNI pods). Nếu không có cờ này, lệnh drain sẽ thất bại vì DaemonSet sẽ tự động tạo lại Pod ngay lập tức trên Node đó.
* `--delete-emptydir-data`: Cho phép xóa Pod có sử dụng ổ đĩa tạm thời `emptyDir` (dữ liệu sẽ bị mất). Trong các phiên bản Kubernetes cũ hơn, cờ này có tên là `--delete-local-data`.
* `--force`: Cưỡng chế trục xuất các Pod đơn lẻ không được quản lý bởi Controller (như ReplicaSet, Deployment, StatefulSet, Job).

---

## 🔍 Kiểm tra kết quả (Verification)

### 1. Kiểm tra trạng thái của Node:
```bash
kubectl get nodes
```
*Kết quả mong muốn:* Node `ek8s-node-1` phải có trạng thái:
```text
ek8s-node-1   Ready,SchedulingDisabled   <roles>   ...
```

### 2. Kiểm tra xem các Pod đã được chuyển đi hết chưa:
```bash
kubectl get pods -A -o wide | grep ek8s-node-1
```
*Kết quả mong muốn:* Không còn bất kỳ Pod nào chạy trên `ek8s-node-1` ngoại trừ các Pod thuộc hệ thống/DaemonSet (như `kube-proxy`, `calico-node`...).

---

## ⚠️ Lưu ý phòng thi
* Đi thi, đề bài thường yêu cầu chuyển ngữ cảnh context trước khi làm. Hãy để ý xem đề bài có yêu cầu SSH vào Master node hoặc chuyển context không (ví dụ: `kubectl config use-context ek8s`).
* Khi khôi phục Node sau bảo trì, lệnh cần dùng là:
  ```bash
  kubectl uncordon ek8s-node-1
  ```
  *(Tuy nhiên đề bài 53 và 78 chỉ yêu cầu rút node chứ không yêu cầu uncordon lại, nên bạn chỉ dừng lại ở bước `drain`)*.
