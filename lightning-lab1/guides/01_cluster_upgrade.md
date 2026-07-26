# Hướng dẫn chi tiết: Nâng cấp cụm K8s từ 1.34.0 lên 1.35.0 & Điều phối Pods

Đây là một bài toán nâng cao kết hợp giữa **Nâng cấp Cụm (Cluster Upgrade)** và **Quản lý vị trí chạy của Pod (Scheduling & Taints/Tolerations)** nhằm tối thiểu hóa downtime.

---

## 📋 Quy trình các bước thực hiện chi tiết

### BƯỚC 1: Nâng cấp Node `controlplane`

1. **Drain node `controlplane`**:
   Đuổi toàn bộ các pod hiện tại ra khỏi controlplane (ngoại trừ DaemonSet):
   ```bash
   kubectl drain controlplane --ignore-daemonsets --delete-emptydir-data --force
   ```

2. **Nâng cấp công cụ `kubeadm`**:
   *Chú ý: Nếu cụm đang cấu hình kho phần mềm (apt repository) của bản cũ v1.34, ta cần chuyển sang v1.35 trước khi cập nhật.*
   - Kiểm tra và đổi cấu hình repo sang `v1.35`:
     ```bash
     sudo sed -i 's/v1.34/v1.35/g' /etc/apt/sources.list.d/kubernetes.list
     sudo apt-get update
     ```
   - Kiểm tra các bản cài đặt khả dụng:
     ```bash
     apt-cache policy kubeadm | grep 1.35.0
     ```
   - Cài đặt bản nâng cấp:
     ```bash
     apt-mark unhold kubeadm
     apt-get install -y kubeadm=1.35.0-1.1
     apt-mark hold kubeadm
     ```

3. **Chạy nâng cấp cụm**:
   ```bash
   kubeadm upgrade plan
   sudo kubeadm upgrade apply v1.35.0 -y
   ```
   > [!NOTE]
   > Quá trình nâng cấp hệ thống (`kubeadm upgrade apply`) trên controlplane node diễn ra khá lâu (thường khoảng 2-5 phút) do Kubernetes phải tải các image của controlplane mới và restart các thành phần cốt lõi (API Server, Controller Manager, Scheduler, ETCD). Hãy kiên nhẫn đợi hệ thống hoàn thành, không ngắt lệnh giữa chừng.


4. **Nâng cấp `kubectl` và `kubelet` trên controlplane**:
   ```bash
   apt-mark unhold kubelet kubectl
   apt-get install -y kubelet=1.35.0-1.1 kubectl=1.35.0-1.1
   apt-mark hold kubelet kubectl
   
   # Restart dịch vụ
   systemctl daemon-reload
   systemctl restart kubelet
   ```

5. **Uncordon node `controlplane`**:
   Cho phép controlplane nhận pod trở lại:
   ```bash
   kubectl uncordon controlplane
   ```

---

### BƯỚC 2: Chuẩn bị cho việc chuyển dịch Pod `gold-nginx`

Mặc định, node `controlplane` có một **Taint** ngăn cản các Pod thường (như `gold-nginx`) chạy trên nó. Để chuyển `gold-nginx` sang controlplane chạy tạm trong lúc ta upgrade `node01`, ta **phải bỏ Taint** này đi.

1. **Kiểm tra Taint hiện tại trên controlplane**:
   ```bash
   kubectl describe node controlplane | grep -i taints
   ```
   *Thường sẽ thấy: `node-role.kubernetes.io/control-plane:NoSchedule` hoặc `node-role.kubernetes.io/master:NoSchedule`.*

2. **Xóa Taint**:
   Chạy cả 2 lệnh sau để đảm bảo xóa sạch taint ngăn cản (dấu `-` ở cuối có nghĩa là xóa taint):
   ```bash
   kubectl taint nodes controlplane node-role.kubernetes.io/control-plane-
   kubectl taint nodes controlplane node-role.kubernetes.io/master-
   ```
   *(Đừng lo nếu một trong hai lệnh báo lỗi không tìm thấy taint, miễn là node sạch taint là được).*

---

### BƯỚC 3: Nâng cấp Node `node01`

1. **Drain node `node01`**:
   Lệnh này sẽ buộc các pod `gold-nginx` đang chạy trên `node01` phải dừng và khởi động lại trên node khả dụng duy nhất còn lại là `controlplane` (vì ta đã xóa taint ở Bước 2).
   ```bash
   kubectl drain node01 --ignore-daemonsets --delete-emptydir-data --force
   ```

2. **Kiểm tra xem pod `gold-nginx` đã chạy trên `controlplane` chưa**:
   ```bash
   kubectl get pods -o wide
   ```
   *Cột `NODE` của pod `gold-nginx` bây giờ phải hiển thị là `controlplane`.*

3. **SSH vào `node01` để tiến hành nâng cấp**:
   ```bash
   ssh node01
   ```

4. **Thực hiện nâng cấp trên `node01`**:
    - Nâng cấp `kubeadm` (nhớ đổi repo sang v1.35 trước):
      ```bash
      sudo sed -i 's/v1.34/v1.35/g' /etc/apt/sources.list.d/kubernetes.list
      sudo apt-get update
      apt-mark unhold kubeadm
      apt-get install -y kubeadm=1.35.0-1.1
      apt-mark hold kubeadm
      ```
   - Cấu hình nâng cấp node:
     ```bash
     sudo kubeadm upgrade node
     ```
   - Nâng cấp `kubelet` và `kubectl` trên `node01`:
     ```bash
     apt-mark unhold kubelet kubectl
     apt-get install -y kubelet=1.35.0-1.1 kubectl=1.35.0-1.1
     apt-mark hold kubelet kubectl
     
     systemctl daemon-reload
     systemctl restart kubelet
     ```
   - Thoát khỏi `node01`:
     ```bash
     exit
     ```

5. **Uncordon node `node01`**:
   ```bash
   kubectl uncordon node01
   ```

---

## 📌 Các điểm cần xác nhận sau khi hoàn thành (Checklist)
1. **Cluster Upgraded?** Chạy `kubectl get nodes` để xem tất cả các node đều có version là `v1.35.0`.
2. **Pods 'gold-nginx' running on controlplane?** Chạy `kubectl get pods -o wide` xem pod `gold-nginx` có đang chạy ổn định ở node `controlplane` không.
