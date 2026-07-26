# Chuyên đề 3: Sử dụng JsonPath, Custom Columns và Sắp Xếp (Câu 4, 7, 8, 12, 21, 25, 30, 33, 60, 61, 67, 74, 79)

Kỳ thi CKA yêu cầu kỹ năng truy vấn nâng cao để trích xuất dữ liệu từ các tài nguyên Kubernetes một cách nhanh chóng mà không cần mở mô tả chi tiết (`describe`). Bài viết này tổng hợp toàn bộ các kỹ thuật sử dụng `jsonpath`, `custom-columns`, `sort-by` và tùy chọn verbosity (`--v`).

---

## 🔍 1. Truy xuất Image Version của Pod (Câu 4, 33)

**Đề bài:** Kiểm tra Image version của một container trong Pod (ví dụ Pod `nginx-dev` hoặc `nginx`) mà không dùng lệnh `describe`.

**Giải pháp:**
* **Truy xuất Image của một Pod cụ thể:**
  ```bash
  kubectl get pod nginx-dev -o jsonpath='{.spec.containers[0].image}'
  ```
* **Truy xuất Image của toàn bộ các Pod trong namespace hiện tại:**
  ```bash
  kubectl get po -o jsonpath='{.items[*].spec.containers[*].image}'
  ```
* **Xuất kèm xuống dòng để dễ đọc:**
  ```bash
  kubectl get po nginx-dev -o jsonpath='{.spec.containers[].image}{"\n"}'
  ```

---

## 📊 2. Định dạng đầu ra với Custom Columns (Câu 7, 67)

**Đề bài:** Liệt kê các Pod với định dạng cột tùy chỉnh gồm tên cột `POD_NAME` và `POD_STATUS`.

**Giải pháp:**
* Bạn có thể lấy trạng thái tổng quan của Pod (`status.phase`):
  ```bash
  kubectl get pods -o=custom-columns="POD_NAME:.metadata.name,POD_STATUS:.status.phase"
  ```
* Hoặc lấy trạng thái cụ thể của Container (`status.containerStatuses[].state` - như trong đáp án SurePass):
  ```bash
  kubectl get pods -o=custom-columns="POD_NAME:.metadata.name,POD_STATUS:.status.containerStatuses[].state"
  ```

---

## 🌐 3. Lấy địa chỉ IP của Pod (Câu 8)

**Đề bài:** Lấy địa chỉ IP của Pod có tên `nginx-dev`.

**Giải pháp:**
* **Cách nhanh nhất:** Dùng cờ `-o wide`:
  ```bash
  kubectl get pod nginx-dev -o wide
  ```
* **Dùng JsonPath trích xuất đúng địa chỉ IP:**
  ```bash
  kubectl get pod nginx-dev -o jsonpath='{.status.podIP}'
  ```
* **Lấy danh sách Tên Pod và IP tương ứng trong namespace (sử dụng loop):**
  ```bash
  kubectl get pods -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.podIP}{"\n"}{end}'
  ```

---

## 📂 4. Liệt kê Tên và Namespace của Pod (Câu 21, 25)

**Đề bài:** Liệt kê tất cả các Pod hiển thị Tên và Namespace bằng biểu thức JsonPath.

**Giải pháp:**
* **Cách viết gom nhóm:**
  ```bash
  kubectl get pods -A -o jsonpath="{.items[*]['metadata.name', 'metadata.namespace']}"
  ```
* **Cách viết dạng danh sách phân tách bằng tab (Khuyên dùng để đọc rõ ràng hơn):**
  ```bash
  kubectl get pods -A -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.metadata.namespace}{"\n"}{end}'
  ```

---

## ⏳ 5. Trích xuất thời gian khởi chạy Pod (Câu 30)

**Đề bài:** In tên Pod và thời gian bắt đầu (start time) vào file `/opt/pod-status`.

*Lưu ý đề thi:* Trong phần giải thích của đề thi SurePass, có sự nhầm lẫn khi đề bài yêu cầu "start time" nhưng đáp án lại dùng `.status.podIP`. Đi thi bạn cần đọc kỹ yêu cầu:
* **Nếu đề yêu cầu Thời gian khởi chạy (Start Time):**
  ```bash
  kubectl get pods -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.startTime}{"\n"}{end}' > /opt/pod-status
  ```
* **Nếu đề yêu cầu IP của Pod (như file giải thích):**
  ```bash
  kubectl get pods -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.podIP}{"\n"}{end}' > /opt/pod-status
  ```

---

## 🗂️ 6. Sắp xếp danh sách Pod (Câu 12, 60, 61)

Bạn có thể dùng cờ `--sort-by` để sắp xếp tài nguyên theo bất kỳ trường JSON nào.

* **Sắp xếp Pod theo Tên (Alphabetical):**
  ```bash
  kubectl get pods --sort-by=.metadata.name
  ```
* **Sắp xếp Pod theo Thời gian tạo (Creation Timestamp):**
  ```bash
  kubectl get pods --sort-by=.metadata.creationTimestamp
  ```

---

## 📝 7. Xuất danh sách Pod ra file cấu hình (Câu 74)

**Đề bài:** Lấy danh sách tất cả các Pod ở mọi namespace và ghi vào file `/opt/pods-list.yaml`.

*Lưu ý đề thi:* Đáp án trong đề thi SurePass ghi lệnh `kubectl get po --all-namespaces > /opt/pods-list.yaml` (dạng bảng mặc định). Tuy nhiên, vì file đích có đuôi `.yaml`, để chắc chắn, bạn nên xuất dưới dạng YAML thực sự nếu đề bài yêu cầu định dạng YAML cấu trúc:
* **Xuất dạng YAML chuẩn:**
  ```bash
  kubectl get pods -A -o yaml > /opt/pods-list.yaml
  ```
* **Xuất dạng bảng thô (nếu làm theo đáp án SurePass):**
  ```bash
  kubectl get po --all-namespaces > /opt/pods-list.yaml
  ```

---

## ⚡ 8. Các mức độ Verbosity trong kubectl (Câu 79)

Khi chạy lệnh `kubectl`, bạn có thể dùng cờ `--v=<level>` để debug và xem log chi tiết của các API requests/responses.

* **`--v=7`**: Hiển thị chi tiết các HTTP request headers được gửi đi.
  ```bash
  kubectl get po nginx --v=7
  ```
* **`--v=8`**: Hiển thị HTTP request headers và cả HTTP response headers.
  ```bash
  kubectl get po nginx --v=8
  ```
* **`--v=9`**: Hiển thị toàn bộ nội dung HTTP request và response body (dạng raw/JSON).
  ```bash
  kubectl get po nginx --v=9
  ```
*(Mẹo nhớ: Level càng cao thì thông tin hiển thị càng chi tiết và dài).*
