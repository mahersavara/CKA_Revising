# Lời giải Mock Exam 3 - Câu 13: Cập nhật & Di cư Ứng dụng bằng Helm (4 điểm)

Bài tập này kiểm tra kỹ năng quản lý ứng dụng bằng Helm, cụ thể là kiểm tra cú pháp (lint), cài đặt một bản Helm Release mới (`webpage-server-02`) từ mã nguồn nội bộ (`/root/new-version`), và gỡ bỏ bản cũ (`webpage-server-01`).

---

## 🛠️ Quy trình thực hiện (Step-by-step)

### Bước 1: Tìm kiếm Namespace của Release cũ `webpage-server-01`
Em chạy lệnh quét toàn cụm:
```bash
helm list -A
```
**Ghi nhận:** Xác định tên **Namespace** nơi `webpage-server-01` đang chạy (ví dụ: `default` hoặc một namespace riêng).

---

### Bước 2: Kiểm thử (Validate/Lint) Chart mới
Trước khi cài đặt, ta cần xác thực tính đúng đắn của file cấu hình Helm Chart tại thư mục `/root/new-version`:
```bash
helm lint /root/new-version
```
*(Lệnh này giúp kiểm tra lỗi cú pháp YAML và cấu trúc chart).*

---

### Bước 3: Cài đặt Release mới `webpage-server-02`
Cài đặt chart từ thư mục `/root/new-version` vào đúng namespace đã tìm thấy ở Bước 1:
```bash
helm install webpage-server-02 /root/new-version -n <tên-namespace-ở-bước-1>
```

---

### Bước 4: Gỡ bỏ Release cũ `webpage-server-01`
Sau khi xác nhận bản mới đã lên thành công, chạy lệnh gỡ bỏ bản cũ:
```bash
helm uninstall webpage-server-01 -n <tên-namespace-ở-bước-1>
```

---

## 🔍 Kiểm tra kết quả (Verification)
```bash
helm list -n <tên-namespace-ở-bước-1>
```

*Kết quả mong muốn:*
* Trong danh sách chỉ còn duy nhất **`webpage-server-02`** ở trạng thái `deployed`.
* Không còn sự xuất hiện của `webpage-server-01`.
