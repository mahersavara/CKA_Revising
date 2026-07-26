# Nhật ký Thực hành Mock Exam 1 - Câu 4: Khởi tạo Service expose Pod

Tài liệu này lưu trữ quá trình thực thi lệnh expose Pod `messaging` bằng Service `messaging-service` trong default namespace.

---

## 💻 Các lệnh đã thực thi

1. **Expose Pod bằng lệnh `kubectl expose`:**
   ```bash
   k expose pod messaging --name=messaging-service --port=6379 --type=ClusterIP
   ```
   *Output:* `service/messaging-service exposed`

2. **Kiểm tra thông tin chi tiết Service:**
   ```bash
   k describe svc messaging-service 
   ```
   *Output thực tế:*
   ```text
   Name:                     messaging-service
   Namespace:                default
   Labels:                   tier=msg
   Selector:                 tier=msg
   Type:                     ClusterIP
   IP:                       172.20.114.177
   Port:                     <unset>  6379/TCP
   TargetPort:               6379/TCP
   Endpoints:                172.17.0.9:6379
   ```
   *(Nhận xét: Selector `tier=msg` đã tự động ánh xạ chính xác đến nhãn của Pod. Endpoint `172.17.0.9:6379` đã được liên kết thành công đến IP của Pod).*
