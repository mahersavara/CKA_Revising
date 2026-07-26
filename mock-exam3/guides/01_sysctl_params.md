# Lời giải Mock Exam 3 - Câu 1: Cấu hình Sysctl Kernel Parameters cho Kubeadm (6 điểm)

Bài tập này kiểm tra kỹ năng chuẩn bị và cấu hình hệ điều hành (Installation & Configuration) trước khi cài đặt Kubernetes bằng Kubeadm, cụ thể là kích hoạt cơ chế chuyển tiếp gói tin (IP Forwarding) và cầu nối mạng (Bridge Netfilter).

---

## 🛠️ Quy trình thực hiện (Step-by-step)

Để cấu hình các tham số mạng này hoạt động ngay lập tức và tự động tải lại sau khi khởi động lại máy (persist across reboots), ta cần làm 2 việc: nạp Kernel Module và ghi file cấu hình Sysctl.

### Bước 1: Nạp Kernel Module `br_netfilter`
Kernel parameter `net.bridge.bridge-nf-call-iptables` yêu cầu module `br_netfilter` phải được kích hoạt trong nhân Linux.

1. **Nạp module ngay lập tức:**
   ```bash
   sudo modprobe br_netfilter
   ```
2. **Cấu hình tự động nạp module khi khởi động lại máy:**
   Chạy khối lệnh sau để ghi module vào thư mục `/etc/modules-load.d/`:
   ```bash
   sudo sh -c 'cat <<EOF > /etc/modules-load.d/k8s.conf
   br_netfilter
   EOF'
   ```

---

### Bước 2: Cấu hình Sysctl Kernel Parameters
1. **Ghi các tham số mạng vào file cấu hình `/etc/sysctl.d/k8s.conf`:**
   ```bash
   sudo sh -c 'cat <<EOF > /etc/sysctl.d/k8s.conf
   net.ipv4.ip_forward = 1
   net.bridge.bridge-nf-call-iptables = 1
   EOF'
   ```

2. **Áp dụng các tham số mới ngay lập tức không cần reboot:**
   ```bash
   sudo sysctl --system
   ```

---

## 🔍 Kiểm tra kết quả (Verification)

Kiểm tra xem các tham số đã nhận giá trị `1` chưa bằng lệnh:

1. **Kiểm tra IP Forward:**
   ```bash
   sysctl net.ipv4.ip_forward
   ```
   *Kết quả đúng:* `net.ipv4.ip_forward = 1`

2. **Kiểm tra Bridge Netfilter:**
   ```bash
   sysctl net.bridge.bridge-nf-call-iptables
   ```
   *Kết quả đúng:* `net.bridge.bridge-nf-call-iptables = 1`
