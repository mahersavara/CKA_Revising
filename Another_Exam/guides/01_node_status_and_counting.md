# Chuyên đề 1: Đếm số lượng Node Ready và Schedulable (Câu 1, 69)

Bài tập này yêu cầu bạn kiểm tra trạng thái của các Node trong cụm Kubernetes, lọc các Node đang ở trạng thái **Ready** và không bị gán taint **NoSchedule**, sau đó ghi kết quả vào một file chỉ định.

---

## 📋 Phân tích yêu cầu đề bài
* **Mục tiêu:** Tìm số lượng Node thỏa mãn đồng thời 2 điều kiện:
  1. Trạng thái: `Ready`
  2. Không có taint: `NoSchedule` (bao gồm cả Master/Control-plane node bị taint mặc định và các Worker node bị taint thủ công).
* **Đường dẫn ghi kết quả:** 
  * Câu 1: `/opt/KUCC00104/kucc00104.txt`
  * Câu 69: `/opt/KUSC00402/kusc00402.txt`

---

## 🛠️ Quy trình thực hiện từng bước

### Bước 1: Kiểm tra danh sách và trạng thái của các Node
Sử dụng lệnh:
```bash
kubectl get nodes
```
*Lưu ý:* Cột `STATUS` sẽ hiển thị `Ready` hoặc `NotReady`. Bạn chỉ đếm các Node có status `Ready`.

### Bước 2: Kiểm tra Taints trên từng Node
Taint ngăn cản việc lập lịch các Pod lên Node. Bạn cần kiểm tra xem Node nào có taints dạng `NoSchedule`. Chạy lệnh sau để hiển thị Taints của các Node một cách nhanh chóng:
```bash
kubectl get nodes -o custom-columns=NAME:.metadata.name,TAINTS:.spec.taints
```
Hoặc dùng lệnh mô tả chi tiết từng Node để tìm dòng `Taints`:
```bash
kubectl describe nodes | grep -i -E "Name:|Taints:"
```

*Ví dụ kết quả:*
```text
Name:               k8s-master-0
Taints:             node-role.kubernetes.io/master:NoSchedule
Name:               k8s-node-0
Taints:             <none>
Name:               k8s-node-1
Taints:             database=true:NoSchedule
```
Trong ví dụ trên:
* `k8s-master-0` có taint `NoSchedule` -> Loại bỏ.
* `k8s-node-0` không có taint -> Thỏa mãn (nếu trạng thái là `Ready`).
* `k8s-node-1` có taint `NoSchedule` -> Loại bỏ.

### Bước 3: Đếm số Node thỏa mãn và ghi vào file
* Nếu số lượng node thỏa mãn là **2**, chạy lệnh ghi kết quả:
  ```bash
  # Đối với Câu 1:
  echo "2" > /opt/KUCC00104/kucc00104.txt
  
  # Đối với Câu 69:
  echo "2" > /opt/KUSC00402/kusc00402.txt
  ```

---

## 🔍 Giải pháp tự động bằng lệnh One-liner (Khuyên dùng)
Nếu muốn giải nhanh và chính xác tuyệt đối mà không cần đếm thủ công, bạn có thể chạy chuỗi lệnh kết hợp `jq`:

```bash
kubectl get nodes -o json | jq '.items[] | select(.status.conditions[] | select(.type=="Ready" and .status=="True")) | select(.spec.taints == null or ([.spec.taints[] | select(.effect=="NoSchedule")] | length == 0)) | .metadata.name' | wc -l
```

**Giải thích lệnh:**
1. Lấy toàn bộ thông tin Node dưới dạng JSON.
2. Lọc các Node có condition `Ready` là `True`.
3. Lọc các Node không có taints (`.spec.taints == null`) hoặc danh sách taints có effect `NoSchedule` bằng `0`.
4. Đếm số dòng (`wc -l`) để ra số lượng Node thỏa mãn.

Ghi trực tiếp kết quả này vào file:
```bash
# Ví dụ cho Câu 1:
kubectl get nodes -o json | jq '.items[] | select(.status.conditions[] | select(.type=="Ready" and .status=="True")) | select(.spec.taints == null or ([.spec.taints[] | select(.effect=="NoSchedule")] | length == 0)) | .metadata.name' | wc -l > /opt/KUCC00104/kucc00104.txt
```

---

## ⚠️ Lưu ý phòng thi
* Đề bài có thể yêu cầu chỉ đếm các **Worker Node**. Tuy nhiên, thông thường đề bài CKA sẽ ghi rõ *"how many worker nodes are ready"* hoặc *"how many nodes are ready schedulable"*.
* Phải đảm bảo thư mục đích tồn tại trước khi ghi. Nếu chưa có, hãy tạo nó trước bằng lệnh:
  ```bash
  mkdir -p /opt/KUCC00104/
  ```
* Không ghi thêm bất kỳ ký tự nào khác ngoài con số vào file kết quả (không ghi khoảng trắng thừa hoặc text).
