# Lời giải Mock Exam 2 - Câu 3: Cấu hình Ingress Resource (10 điểm)

Bài tập này kiểm tra kỹ năng cấu hình định tuyến lưu lượng truy cập từ ngoài cụm vào các dịch vụ bên trong (Services & Networking) sử dụng **Ingress Controller**.

---

## 🛠️ Quy trình thực hiện nhanh nhất (Imperative Command)

Ingress là tài nguyên có thể được tạo cực nhanh bằng lệnh gõ tắt `kubectl create ingress`:

### Bước 1: Khởi tạo Ingress bằng một lệnh duy nhất
Em chạy lệnh này trên terminal `controlplane`:
```bash
kubectl create ingress webapp-ingress \
  -n ingress-ns \
  --rule="kodekloud-ingress.app/=webapp-svc:80" \
  --class=nginx
```

---

## 🔍 Phân tích chi tiết cú pháp lệnh:

* **`kubectl create ingress webapp-ingress`**: Khởi tạo Ingress có tên là `webapp-ingress`.
* **`-n ingress-ns`**: Chỉ định chạy trong namespace `ingress-ns` (phải trùng với namespace của deployment và service).
* **`--rule="kodekloud-ingress.app/=webapp-svc:80"`**: Khai báo rule định tuyến:
  * Host: `kodekloud-ingress.app`
  * Path: `/` (Mặc định `pathType` sinh ra sẽ là `Prefix`).
  * Backend Service: `webapp-svc` ở cổng `80`.
* **`--class=nginx`**: Khai báo `ingressClassName: nginx`. Cấu hình này rất quan trọng để bộ NGINX Ingress Controller đang chạy trong cụm biết để nạp và xử lý định tuyến cho Ingress này.

---

## 🔍 Kiểm tra kết quả (Verification)

### 1. Kiểm tra trạng thái Ingress:
```bash
kubectl get ingress -n ingress-ns
```
*Yêu cầu kết quả:* 
* Cột `CLASS` hiển thị đúng `nginx`.
* Cột `HOSTS` là `kodekloud-ingress.app`.
* Cột `ADDRESS` sẽ hiển thị IP của Ingress Controller (có thể mất khoảng 10-30 giây để hiển thị IP).

### 2. Kiểm tra xem ứng dụng đã sẵn sàng phục vụ chưa:
Chạy lệnh `curl` để gửi yêu cầu đến host:
```bash
curl -s http://kodekloud-ingress.app/
```
*Kết quả mong muốn:* Trả về mã nguồn HTML hoặc thông báo thành công của ứng dụng webapp (không được báo lỗi `502 Bad Gateway` hay `503 Service Unavailable`).
