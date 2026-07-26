# Lời giải Mock Exam 3 - Câu 14: Xác định Pod Network CIDR của Cụm (4 điểm)

Bài tập này kiểm tra kỹ năng quản lý mạng (Services & Networking) và hiểu biết cấu trúc cài đặt của cụm (Cluster Infrastructure), cụ thể là tìm dải mạng IP cấp phát cho Pod (Pod Network CIDR) được định cấu hình từ đầu qua Kubeadm.

---

## 🛠️ Quy trình thực hiện (Step-by-step)

### Bước 1: Truy vấn dải mạng Pod Subnet từ ConfigMap `kubeadm-config`
Theo đúng lưu ý đề bài, ta không lấy dải mạng cục bộ của từng Node mà lấy cấu hình chung của toàn cụm được lưu trữ trong ConfigMap cấu hình của Kubeadm ở namespace `kube-system`.

Chạy lệnh truy vấn sau:
```bash
kubectl get configmap kubeadm-config -n kube-system -o yaml | grep -i podSubnet
```

*Kết quả ví dụ hiển thị:*
```text
podSubnet: 10.244.0.0/16
```
*(Hãy ghi nhận lại dải mạng IP chính xác hiển thị trên màn hình, ví dụ `10.244.0.0/16` hoặc dải mạng khác tùy cấu hình cụm lab).*

---

### Bước 2: Ghi dải mạng IP vào file kết quả `/root/pod-cidr.txt`
Sử dụng lệnh `echo` để ghi duy nhất dải IP này vào file:

```bash
echo "10.244.0.0/16" > /root/pod-cidr.txt
```
*(⚠️ Thay thế `10.244.0.0/16` bằng giá trị chính xác em tìm thấy ở Bước 1).*

---

## 🔍 Kiểm tra kết quả (Verification)
```bash
cat /root/pod-cidr.txt
```
*Đảm bảo file chỉ chứa duy nhất dải IP mạng chuẩn dạng `x.x.x.x/x` không kèm theo từ khóa hay ký tự thừa.*
