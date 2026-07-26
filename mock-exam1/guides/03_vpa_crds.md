# Lời giải Mock Exam 1 - Câu 3: Liệt kê CRDs của VerticalPodAutoscaler (6 điểm)

Bài tập này kiểm tra kỹ năng truy vấn và bộ lọc tài nguyên mở rộng (Custom Resource Definitions - CRDs) trong cụm Kubernetes.

---

## 🛠️ Quy trình thực hiện nhanh (Imperative Commands)

Để lấy chính xác danh sách tên các CRD liên quan đến `VerticalPodAutoscaler` và ghi vào file `/root/vpa-crds.txt`, em chạy lệnh sau trên node `controlplane`:

```bash
kubectl get crd | grep -i verticalpodautoscaler | awk '{print $1}' > /root/vpa-crds.txt
```

---

## 🔍 Giải thích chi tiết lệnh:

1. **`kubectl get crd` (hoặc `kubectl get customresourcedefinitions`)**: Liệt kê toàn bộ các Custom Resource Definitions hiện có trong cụm.
2. **`grep -i verticalpodautoscaler`**: Lọc ra các dòng có chứa từ khóa `verticalpodautoscaler` (không phân biệt chữ hoa/chữ thường nhờ cờ `-i`).
3. **`awk '{print $1}'`**: Trích xuất cột đầu tiên của kết quả (chính là tên của CRD, bỏ qua cột ngày giờ khởi tạo).
4. **`> /root/vpa-crds.txt`**: Ghi đè danh sách tên này vào file đích.

---

## 🔍 Xác nhận kết quả (Verification)

Kiểm tra nội dung file `/root/vpa-crds.txt`:
```bash
cat /root/vpa-crds.txt
```

*Kết quả mong muốn hiển thị dạng (tùy thuộc vào phiên bản VPA được cài đặt):*
```text
verticalpodautoscalercheckpoints.autoscaling.k8s.io
verticalpodautoscalers.autoscaling.k8s.io
```
*(Nếu hiển thị đúng dạng danh sách tên như trên, em đã hoàn thành xuất sắc câu này!)*
