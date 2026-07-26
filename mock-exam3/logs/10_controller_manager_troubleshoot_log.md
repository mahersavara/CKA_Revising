# Nhật ký Thực hành Mock Exam 3 - Câu 10: Troubleshoot Kube-Controller-Manager

Tài liệu này lưu trữ quá trình chẩn đoán sự cố của `kube-controller-manager` khiến Deployment không thể tự động scale, và khắc phục thành công trên cụm.

---

## 💻 Các lệnh đã thực thi

1. **Thực thi lệnh scale Deployment:**
   ```bash
   kubectl scale deployment nginx-deploy --replicas=3
   ```

2. **Dò lỗi trạng thái Pod hệ thống:**
   ```bash
   kubectl get pods -n kube-system
   ```
   *(Phát hiện Pod `kube-controller-manager-controlplane` bị lỗi CrashLoopBackOff hoặc không hoạt động).*

3. **Kiểm tra file cấu hình Static Pod và các file liên quan:**
   ```bash
   ls -la /etc/kubernetes/
   cat /etc/kubernetes/manifests/kube-controller-manager.yaml
   ```
   *(Phát hiện điểm cấu hình sai, ví dụ: sai tên file kubeconfig hoặc sai cờ).*

4. **Chỉnh sửa file cấu hình sửa lỗi:**
   ```bash
   sudo nano /etc/kubernetes/manifests/kube-controller-manager.yaml
   ```

5. **Xác nhận kết quả:**
   ```bash
   kubectl get pods -n kube-system | grep controller
   kubectl get deployment nginx-deploy
   ```
   *Output thực tế mong muốn:*
   ```text
   NAME                            READY   STATUS    RESTARTS   AGE
   nginx-deploy-xxxx-xxxx          1/1     Running   0          5s
   nginx-deploy-yyyy-yyyy          1/1     Running   0          5s
   nginx-deploy-zzzz-zzzz          1/1     Running   0          5s
   ```
   *(Nhận xét: Sau khi Controller Manager phục hồi, Deployment lập tức nhận diện sự kiện scale và tạo đủ 3 Pod ở trạng thái Running).*
