# Nhật ký Thực hành Mock Exam 1 - Câu 3: Liệt kê CRDs của VerticalPodAutoscaler

Tài liệu này lưu trữ quá trình lọc và ghi thông tin CRDs của VerticalPodAutoscaler trên node controlplane.

---

## 💻 Các lệnh đã thực thi

1. **Lọc và ghi kết quả vào file `/root/vpa-crds.txt`:**
   ```bash
   k get crd | grep -i verticalpodautoscaler | awk '{print $1}' > /root/vpa-crds.txt
   ```

2. **Kiểm tra nội dung file kết quả:**
   ```bash
   cat /root/vpa-crds.txt
   ```

3. **Output thực tế:**
   ```text
   verticalpodautoscalercheckpoints.autoscaling.k8s.io
   verticalpodautoscalers.autoscaling.k8s.io
   ```
   *(Kết quả hiển thị chính xác tên của 2 CustomResourceDefinitions liên quan đến VPA).*
