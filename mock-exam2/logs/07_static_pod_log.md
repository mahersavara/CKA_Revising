# Nhật ký Thực hành Mock Exam 2 - Câu 7: Khởi tạo Static Pod trên Worker Node

Tài liệu này lưu trữ quá trình khởi tạo Static Pod `nginx-critical` thành công trên Worker Node `node01`.

---

## 💻 Các lệnh đã thực thi

1. **SSH sang Worker Node `node01`:**
   ```bash
   ssh node01
   ```

2. **Tạo file cấu hình Static Pod:**
   ```bash
   sudo nano /etc/kubernetes/manifests/nginx-critical.yaml
   ```
   *Nội dung cấu hình:*
   ```yaml
   apiVersion: v1
   kind: Pod
   metadata:
     name: nginx-critical
   spec:
     containers:
     - name: nginx-critical
       image: nginx
   ```

3. **Thoát trở lại `controlplane`:**
   ```bash
   exit
   ```

4. **Kiểm tra và xác nhận trên `controlplane`:**
   ```bash
   k get pods -o wide
   ```
   *Output thực tế:*
   ```text
   NAME                            READY   STATUS    RESTARTS   AGE   IP            NODE     
   nginx-critical-node01           1/1     Running   0          28s   172.17.1.21   node01   
   ```
   *(Nhận xét: Kubelet trên node01 đã tự phát hiện file cấu hình mới và khởi chạy Pod nginx-critical-node01 thành công trên node01).*
