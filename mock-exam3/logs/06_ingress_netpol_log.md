# Nhật ký Thực hành Mock Exam 3 - Câu 6: Cấu hình NetworkPolicy cho phép Ingress Traffic

Tài liệu này lưu trữ quá trình kiểm tra nhãn của Pod `np-test-1`, thiết lập và áp dụng NetworkPolicy `ingress-to-nptest` để mở cổng 80 thành công.

---

## 💻 Các lệnh đã thực thi

1. **Kiểm tra nhãn của Pod `np-test-1`:**
   ```bash
   kubectl get pod np-test-1 --show-labels
   ```
   *Output thực tế:* (Ghi nhận nhãn của Pod, ví dụ: `run=np-test-1`).

2. **Khởi tạo file cấu hình `/tmp/ingress-to-nptest.yaml`:**
   ```bash
   cat <<EOF > /tmp/ingress-to-nptest.yaml
   apiVersion: networking.k8s.io/v1
   kind: NetworkPolicy
   metadata:
     name: ingress-to-nptest
     namespace: default
   spec:
     podSelector:
       matchLabels:
         run: np-test-1
     policyTypes:
     - Ingress
     ingress:
     - ports:
       - protocol: TCP
         port: 80
   EOF
   ```

3. **Apply cấu hình:**
   ```bash
   kubectl apply -f /tmp/ingress-to-nptest.yaml
   ```
   *Output:* `networkpolicy.networking.k8s.io/ingress-to-nptest created`

4. **Kiểm tra danh sách NetworkPolicy:**
   ```bash
   kubectl get netpol
   ```
   *Output:* (Hiển thị danh sách chứa cả `default-deny` và `ingress-to-nptest`).

5. **Kiểm tra kết nối tới service:**
   ```bash
   kubectl run test-connection --image=busybox:1.28 --restart=Never --rm -it -- wget -qO- http://np-test-service
   ```
   *Output thực tế:* (Kết nối thành công tới dịch vụ và in ra nội dung phản hồi).
