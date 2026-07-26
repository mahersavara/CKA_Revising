# Nhật ký Thực hành Mock Exam 2 - Câu 6: Kiểm tra DNS Resolution & Pod/Service

Tài liệu này lưu trữ quá trình kiểm tra phân giải tên miền (DNS) của Pod `nginx-resolver` và Service `nginx-resolver-service` thành công bằng cách sử dụng phương pháp log sạch (clean logging).

---

## 💻 Các lệnh đã thực thi

1. **Tạo Pod và Service:**
   ```bash
   kubectl run nginx-resolver --image=nginx
   kubectl expose pod nginx-resolver --name=nginx-resolver-service --port=80 --type=ClusterIP
   ```

2. **Phân giải DNS của Pod (Sử dụng phương pháp log sạch):**
   ```bash
   export POD_IP=$(kubectl get pod nginx-resolver -o jsonpath='{.status.podIP}')
   export POD_IP_DASH=$(echo $POD_IP | tr '.' '-')

   kubectl run test-nslookup-pod --image=busybox:1.28 --restart=Never -- nslookup ${POD_IP_DASH}.default.pod.cluster.local
   sleep 3
   kubectl logs test-nslookup-pod > /root/CKA/nginx.pod
   kubectl delete pod test-nslookup-pod
   ```

3. **Phân giải DNS của Service (Sử dụng phương pháp log sạch):**
   ```bash
   kubectl run test-nslookup-svc --image=busybox:1.28 --restart=Never -- nslookup nginx-resolver-service
   sleep 3
   kubectl logs test-nslookup-svc > /root/CKA/nginx.svc
   kubectl delete pod test-nslookup-svc
   ```

4. **Xác nhận kết quả:**
   * File `/root/CKA/nginx.pod`:
     ```text
     Server:    172.20.0.10
     Address 1: 172.20.0.10 kube-dns.kube-system.svc.cluster.local

     Name:      172-17-1-14.default.pod.cluster.local
     Address 1: 172.17.1.14 172-17-1-14.nginx-resolver-service.default.svc.cluster.local
     ```
   * File `/root/CKA/nginx.svc`:
     ```text
     Server:    172.20.0.10
     Address 1: 172.20.0.10 kube-dns.kube-system.svc.cluster.local

     Name:      nginx-resolver-service
     Address 1: 172.20.121.153 nginx-resolver-service.default.svc.cluster.local
     ```
   *(Nhận xét: Cả hai file đã chứa kết quả phân giải DNS hoàn hảo, không có bất kỳ dòng thông báo hệ thống thừa nào).*
