# Chuyên đề 9: Cấu Hình Ingress, Services và Truy Vấn DNS (Câu 9, 18, 40, 46, 51, 77)

Chuyên đề này hướng dẫn bạn cách thiết lập định tuyến mạng trong cụm Kubernetes thông qua **Services (đặc biệt là NodePort)**, **Ingress Resources (định tuyến HTTP/S)**, và cách kiểm tra phân giải tên miền **DNS** bằng công cụ `nslookup`.

---

## 🌐 1. Cấu hình Ingress Resource (Câu 9, 51)

Ingress định tuyến traffic từ ngoài cụm vào các Services bên trong thông qua các quy tắc (rules) cấu hình sẵn.

### Lớp bài toán A: Ingress Ping (Câu 9)
**Đề bài:** Tạo một Ingress tên `ping` trong namespace `ing-internal`, trỏ đường dẫn `/hi` tới service `hi` có cổng `5678`.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ping
  namespace: ing-internal
spec:
  rules:
  - http:
      paths:
      - path: /hi
        pathType: Prefix
        backend:
          service:
            name: hi
            port:
              number: 5678
```
*Lệnh tạo:* `kubectl apply -f ingress-ping.yaml`

---

### Lớp bài toán B: Ingress Echo có Rewrite Target (Câu 51)
**Đề bài:** Tạo một Ingress tên `echo` trong namespace `sound-repeater` ánh xạ host `example.org` và đường dẫn `/echo` tới service `echoserver-service` cổng `8080`. Sử dụng rewrite-target.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: echo
  namespace: sound-repeater
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$1  # 👈 Rewrite path để chuyển tiếp traffic sạch
spec:
  rules:
  - host: example.org                                # 👈 Ràng buộc host
    http:
      paths:
      - path: /echo
        pathType: Prefix
        backend:
          service:
            name: echoserver-service
            port:
              number: 8080
```
*Lệnh tạo:* `kubectl apply -f ingress-echo.yaml`

---

## 🔌 2. Cấu hình Expose Port & NodePort Service (Câu 18, 40, 46)

Bài toán yêu cầu cập nhật Pod/Deployment cũ để khai báo cổng container (nếu chưa có), sau đó tạo một Service kiểu `NodePort` để công khai dịch vụ ra ngoài thông qua cổng của Node.

### Quy trình thực hiện (Câu 46 làm ví dụ):
1. **Kiểm tra và sửa Deployment:**
   Mở file cấu hình Deployment `front-end` để khai báo thêm port `80` đặt tên là `http` cho container:
   ```bash
   kubectl edit deployment front-end -n <namespace>
   ```
   *Cấu trúc sửa trong yaml:*
   ```yaml
   spec:
     containers:
     - name: nginx
       image: nginx
       ports:                           # 👈 Thêm dòng ports
       - name: http                     # Đặt tên cho port
         containerPort: 80
         protocol: TCP
   ```

2. **Tạo Service NodePort:**
   Sử dụng lệnh expose nhanh từ Deployment:
   ```bash
   kubectl expose deployment front-end --name=front-end-svc --port=80 --target-port=http --type=NodePort -n <namespace>
   ```
   *Lưu ý:* Nếu đề bài yêu cầu cụ thể `--target-port` trỏ vào cổng số `80` (thay vì tên `http`):
   ```bash
   kubectl expose deployment front-end --name=front-end-svc --port=80 --target-port=80 --type=NodePort -n <namespace>
   ```

3. **Kiểm tra cổng NodePort đã tự động sinh (hoặc chỉ định):**
   ```bash
   kubectl get svc front-end-svc -n <namespace>
   ```
   Xem phần `PORT(S)` hiển thị dạng `80:3XXXX/TCP`, trong đó `3XXXX` (30000-32767) chính là cổng NodePort.

---

## 🔍 3. Truy vấn DNS của Service và Pod (Câu 77)

**Đề bài:** Tạo deployment `nginx-random` và expose qua service cùng tên. Sử dụng `nslookup` để tra cứu bản ghi DNS của Service và Pod, lưu kết quả lần lượt vào `/opt/KUNW00601/service.dns` và `/opt/KUNW00601/pod.dns`.

### Bước 1: Tạo Deployment và Service
```bash
kubectl create deploy nginx-random --image=nginx
kubectl expose deploy nginx-random --name=nginx-random --port=80 --target-port=80
```

### Bước 2: Tạo Pod phụ để chạy nslookup
Chúng ta chạy một Pod phụ (dùng image `busybox:1.28` vì có công cụ nslookup ổn định):
```bash
kubectl run busybox-dns --image=busybox:1.28 --restart=Never -- sleep 3600
```
*Đợi Pod chuyển sang trạng thái Running.*

### Bước 3: Tra cứu DNS của Service
Trong Kubernetes, DNS của Service có dạng: `<tên-service>.<namespace>.svc.cluster.local` (hoặc gọi ngắn gọn bằng tên service nếu cùng namespace).

Chạy lệnh truy vấn và ghi kết quả:
```bash
kubectl exec busybox-dns -- nslookup nginx-random > /opt/KUNW00601/service.dns
```

### Bước 4: Tra cứu DNS của Pod
Trong Kubernetes, một Pod có IP dạng `A.B.C.D` sẽ có DNS phân giải dạng: `A-B-C-D.<namespace>.pod.cluster.local`.

1. **Lấy IP của một Pod thuộc deployment `nginx-random`:**
   ```bash
   kubectl get pods -l app=nginx-random -o wide
   # Giả sử IP là: 10.244.2.16
   ```
2. **Chuyển dấu chấm thành dấu gạch ngang:** `10.244.2.16` -> `10-244-2-16`.
3. **Thực hiện truy vấn qua Pod phụ:**
   ```bash
   kubectl exec busybox-dns -- nslookup 10-244-2-16.default.pod.cluster.local > /opt/KUNW00601/pod.dns
   ```

### Bước 5: Dọn dẹp
```bash
kubectl delete pod busybox-dns
```
