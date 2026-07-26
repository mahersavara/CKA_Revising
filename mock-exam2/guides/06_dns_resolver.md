# Lời giải Mock Exam 2 - Câu 6: Kiểm tra DNS Resolution & Pod/Service (10 điểm)

Bài tập này kiểm tra kiến thức về mạng và phân giải tên miền (DNS & CoreDNS) bên trong cụm Kubernetes.

---

## 🛠️ Quy trình thực hiện (Step-by-step)

### Bước 1: Tạo Pod `nginx-resolver`
Chạy lệnh gõ nhanh để tạo Pod chạy ảnh `nginx`:
```bash
kubectl run nginx-resolver --image=nginx
```

### Bước 2: Tạo Service `nginx-resolver-service` loại ClusterIP
Expose Pod vừa tạo thành Service lắng nghe ở cổng `80` (hoặc cổng bất kỳ, thường là 80):
```bash
kubectl expose pod nginx-resolver \
  --name=nginx-resolver-service \
  --port=80 \
  --type=ClusterIP
```

---

### Bước 3: Phân giải DNS của Service và lưu kết quả
Sử dụng ảnh `busybox:1.28` chạy container tạm thời để phân giải tên miền Service bằng `nslookup`:
```bash
kubectl run test-nslookup \
  --image=busybox:1.28 \
  --restart=Never \
  --rm -i \
  -- nslookup nginx-resolver-service > /root/CKA/nginx.svc
```
*(Đường dẫn `/root/CKA` đã được tạo sẵn trong đề bài).*

---

### Bước 4: Phân giải DNS của Pod và lưu kết quả
Trong Kubernetes, địa chỉ IP của Pod được gán một bản ghi DNS định dạng:
`<IP-dạng-dấu-gạch-ngang>.<namespace>.pod.cluster.local`

1. **Lấy địa chỉ IP của Pod `nginx-resolver`:**
   ```bash
   export POD_IP=$(kubectl get pod nginx-resolver -o jsonpath='{.status.podIP}')
   ```
2. **Chuyển các dấu chấm `.` trong IP thành dấu gạch ngang `-`:**
   ```bash
   export POD_IP_DASH=$(echo $POD_IP | tr '.' '-')
   ```
3. **Chạy `nslookup` phân giải tên miền của Pod:**
   ```bash
   kubectl run test-nslookup \
     --image=busybox:1.28 \
     --restart=Never \
     --rm -i \
     -- nslookup ${POD_IP_DASH}.default.pod.cluster.local > /root/CKA/nginx.pod
   ```

---

## 🔍 Kiểm tra kết quả (Verification)

Kiểm tra nội dung các file kết quả đã lưu trên `controlplane`:

1. **Kiểm tra DNS của Service:**
   ```bash
   cat /root/CKA/nginx.svc
   ```
   *Kết quả mong muốn (hiển thị IP của Service):*
   ```text
   Server:    10.96.0.10
   Address 1: 10.96.0.10 kube-dns.kube-system.svc.cluster.local

   Name:      nginx-resolver-service
   Address 1: 10.108.196.220 nginx-resolver-service.default.svc.cluster.local
   ```

2. **Kiểm tra DNS của Pod:**
   ```bash
   cat /root/CKA/nginx.pod
   ```
   *Kết quả mong muốn (hiển thị IP của Pod):*
   ```text
   Server:    10.96.0.10
   Address 1: 10.96.0.10 kube-dns.kube-system.svc.cluster.local

   Name:      10-244-1-5.default.pod.cluster.local
   Address 1: 10.244.1.5 10-244-1-5.default.pod.cluster.local
   ```
