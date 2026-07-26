# Nhật ký Thực hành Mock Exam 3 - Câu 1: Cấu hình Sysctl Kernel Parameters

Tài liệu này lưu trữ quá trình nạp module nhân Linux `br_netfilter` và thiết lập các tham số mạng sysctl thành công trên hệ thống.

---

## 💻 Các lệnh đã thực thi

1. **Nạp module nhân và cấu hình tải tự động khi boot:**
   ```bash
   sudo modprobe br_netfilter
   sudo sh -c 'cat <<EOF > /etc/modules-load.d/k8s.conf
   br_netfilter
   EOF'
   ```

2. **Ghi cấu hình sysctl:**
   ```bash
   sudo sh -c 'cat <<EOF > /etc/sysctl.d/k8s.conf
   net.ipv4.ip_forward = 1
   net.bridge.bridge-nf-call-iptables = 1
   EOF'
   ```

3. **Nạp cấu hình hệ thống:**
   ```bash
   sudo sysctl --system
   ```

4. **Xác nhận kết quả:**
   ```bash
   sysctl net.ipv4.ip_forward net.bridge.bridge-nf-call-iptables
   ```
   *Output thực tế:*
   ```text
   net.ipv4.ip_forward = 1
   net.bridge.bridge-nf-call-iptables = 1
   ```
   *(Nhận xét: Các thông số mạng sysctl đã được thiết lập thành công về giá trị 1 và duy trì sau khi reboot).*
