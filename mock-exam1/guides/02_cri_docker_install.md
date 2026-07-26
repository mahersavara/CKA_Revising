# Lời giải Mock Exam 1 - Câu 2: Cài đặt Container Runtime (`cri-docker`) trên `node01` (7 điểm)

Bài tập này kiểm tra kỹ năng quản lý và cấu hình hạ tầng node của cụm Kubernetes (Cluster Maintenance & Node Administration), cụ thể là cài đặt gói phần mềm offline (`.deb`) và quản lý tiến trình bằng `systemd`.

---

## 🔍 Phân tích các bước thực hiện

### Bước 1: Xác định vị trí file cài đặt
Đề bài cho biết file `cri-docker_0.3.16.3-0.debian.deb` nằm ở thư mục `/root`. 
Ta cần kiểm tra xem nó nằm ở `/root` của **`controlplane`** (node hiện tại của em) hay `/root` của **`node01`** (node cần cài đặt).

1. Chạy lệnh kiểm tra trên `controlplane`:
   ```bash
   ls /root | grep cri-docker
   ```
2. **Nếu có file trên `controlplane`:** Ta cần chuyển file này sang `node01` bằng lệnh `scp` (Secure Copy) trước khi SSH sang:
   ```bash
   scp /root/cri-docker_0.3.16.3-0.debian.deb bob@node01:/tmp/
   ```
3. **SSH sang node `node01`:**
   ```bash
   ssh bob@node01
   # Nhập mật khẩu: caleston123
   ```

---

## 🛠️ Cài đặt và Cấu hình dịch vụ trên `node01`

Sau khi đã SSH sang `node01`:

### Bước 2: Cài đặt gói `.deb`
* **Trường hợp A (Nếu file đã được scp sang `/tmp`):**
  ```bash
  sudo dpkg -i /tmp/cri-docker_0.3.16.3-0.debian.deb
  ```
* **Trường hợp B (Nếu file có sẵn trong `/root` của `node01`):**
  ```bash
  sudo dpkg -i /root/cri-docker_0.3.16.3-0.debian.deb
  ```

*Lưu ý:* Nếu lệnh `dpkg -i` báo lỗi thiếu thư viện phụ thuộc (dependencies), hãy chạy lệnh sửa lỗi phụ thuộc tự động của apt:
```bash
sudo apt-get install -f -y
```

### Bước 3: Khởi động và kích hoạt (Enable) dịch vụ `cri-docker`
Sử dụng `systemctl` để kích hoạt dịch vụ chạy cùng hệ thống (enable) và khởi động nó ngay lập tức (start):
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now cri-docker
```

---

## 🔍 Kiểm tra kết quả (Verification)

Chạy lệnh kiểm tra trạng thái dịch vụ trên `node01`:
```bash
systemctl status cri-docker
```
*Yêu cầu kết quả:*
* Dòng trạng thái hoạt động: **`Active: active (running)`**
* Dòng khởi động cùng hệ thống: **`Loaded: ...; enabled; ...`**

Khi dịch vụ đã `active (running)` và `enabled`, em gõ `exit` để thoát khỏi `node01` quay lại `controlplane`.
