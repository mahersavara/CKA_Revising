# Nhật ký Thực hành Mock Exam 1 - Câu 5: Tạo Deployment `hr-web-app`

Tài liệu này lưu trữ quá trình khởi tạo Deployment `hr-web-app` thành công trên cụm lab.

---

## 💻 Các lệnh đã thực thi

1. **Khởi tạo Deployment:**
   ```bash
   k create deployment hr-web-app --image=kodekloud/webapp-color --replicas=2
   ```
   *Output:* `deployment.apps/hr-web-app created`

2. **Kiểm tra trạng thái triển khai:**
   ```bash
   k get deployments.apps hr-web-app -o wide
   ```
   *Output thực tế:*
   ```text
   NAME         READY   UP-TO-DATE   AVAILABLE   AGE   CONTAINERS     IMAGES                   SELECTOR
   hr-web-app   2/2     2            2           16s   webapp-color   kodekloud/webapp-color   app=hr-web-app
   ```
   *(Nhận xét: Deployment đã sẵn sàng hoạt động với 2/2 replica đang chạy ổn định).*
