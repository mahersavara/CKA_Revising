# Nhật ký Thực hành Mock Exam 1 - Câu 2: Cài đặt Container Runtime trên `node01`

Tài liệu này lưu trữ quá trình cài đặt và kích hoạt dịch vụ `cri-docker` trên `node01` bằng user `bob`.

---

## 💻 Các lệnh đã thực thi

1. **SSH sang node01 bằng tài khoản bob:**
   ```bash
   ssh bob@node01
   # Nhập mật khẩu: caleston123
   ```

2. **Cài đặt gói `.deb` nằm ở `/root` của node01:**
   ```bash
   sudo dpkg -i /root/cri-docker_0.3.16.3-0.debian.deb
   ```
   *Output:*
   ```text
   Selecting previously unselected package cri-dockerd.
   Unpacking cri-dockerd ...
   Setting up cri-dockerd ...
   Created symlink ...
   /usr/sbin/policy-rc.d returned 101, not running 'start cri-docker.service cri-docker.socket'
   ```
   *(Lưu ý: Lỗi policy-rc.d 101 là bình thường trên các container lab của KodeKloud/Docker, dịch vụ sẽ không tự khởi động mà cần chúng ta start thủ công).*

3. **Khởi động và kích hoạt dịch vụ chạy cùng OS:**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable --now cri-docker
   ```

4. **Kiểm tra trạng thái dịch vụ (để xác nhận hoạt động):**
   ```bash
   systemctl status cri-docker
   ```
   *Output mong muốn:*
   ```text
   ● cri-docker.service - CRI Attach/Detach/Modify Docker Containers
        Loaded: loaded (/lib/systemd/system/cri-docker.service; enabled; vendor preset: enabled)
        Active: active (running) since ...
   ```
