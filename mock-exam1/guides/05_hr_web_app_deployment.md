# Lời giải Mock Exam 1 - Câu 5: Tạo Deployment `hr-web-app` (10 điểm)

Bài tập này kiểm tra kỹ năng cơ bản về quản lý vòng đời ứng dụng (Workloads & Scheduling), cụ thể là tạo một Deployment chạy nhiều bản sao (replicas).

---

## 🛠️ Quy trình thực hiện nhanh nhất (Imperative Command)

Sử dụng lệnh `kubectl create deployment` để tự động sinh và apply cấu hình:
```bash
kubectl create deployment hr-web-app \
  --image=kodekloud/webapp-color \
  --replicas=2
```

---

## 🔍 Kiểm tra kết quả (Verification)

### 1. Kiểm tra trạng thái Deployment:
```bash
kubectl get deployments hr-web-app -o wide
```
*Yêu cầu:* Cột `READY` phải hiển thị là `2/2` và `AVAILABLE` là `2`.

### 2. Kiểm tra danh sách Pod được tạo ra:
```bash
kubectl get pods -l app=hr-web-app
```
*Kết quả phải có 2 pod thuộc deployment này ở trạng thái `Running`.*
