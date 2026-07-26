# Lời giải Mock Exam 2 - Câu 11: Chọn và áp dụng NetworkPolicy phù hợp (6 điểm)

Bài tập này kiểm tra kỹ năng phân tích và cấu hình chính sách bảo mật mạng (NetworkPolicies), yêu cầu lựa chọn chính sách mạng có mức độ giới hạn cao nhất (most restrictive) từ các file cấu hình có sẵn để chỉ cho phép traffic đi từ namespace `frontend` vào namespace `backend`.

---

## 🔍 Phân tích yêu cầu đề bài

1. **Namespace chứa Policy:** Policy phải được tạo trong namespace **`backend`** (vì nó chặn/cho phép traffic đi **VÀO** ứng dụng backend).
2. **Nguồn traffic được phép (Ingress From):** Chỉ cho phép từ namespace **`frontend`**.
3. **Nguồn traffic bị chặn:** Không cho phép từ namespace **`databases`**.
4. **Mức độ bảo mật:** Chọn chính sách hạn chế nhất (most restrictive).

---

## 🛠️ Quy trình thực hiện (Step-by-step)

### Bước 1: Kiểm tra các file YAML có sẵn trong thư mục `/root`
Em chạy lệnh liệt kê và xem nội dung các file cấu hình chính sách mạng có sẵn:
```bash
ls -la /root
```
*(Thường sẽ có các file như `policy1.yaml`, `policy2.yaml`, `policy3.yaml` hoặc tên tương tự).*

Em in nội dung của các file này ra để đối chiếu:
```bash
cat /root/policy*.yaml  # Hoặc tên file cụ thể tương ứng
```

---

### Bước 2: Phân tích và lựa chọn Policy chính xác

Một NetworkPolicy đúng và an toàn nhất (most restrictive) thường có cấu trúc:
1. `metadata.namespace: backend` (Chạy trong namespace backend).
2. `spec.podSelector: {}` (Áp dụng cho tất cả Pod trong namespace backend).
3. `spec.policyTypes: [Ingress]` (Chỉ cấu hình chặn đầu vào).
4. `spec.ingress:`
   * `from:`
     * `namespaceSelector:`
         `matchLabels:`
           `kubernetes.io/metadata.name: frontend` (Hoặc nhãn cụ thể của namespace frontend như `name: frontend`).

#### ⚠️ Các lỗi cần tránh ở các policy sai:
* **Lỗi 1 (Quá rộng):** Cho phép cả `frontend` lẫn `databases` (chọn namespaceSelector của cả hai).
* **Lỗi 2 (Nhầm hướng):** Đặt nhãn selector sai hoặc cấu hình ở sai namespace (ví dụ đặt ở namespace default).
* **Lỗi 3 (Quá lỏng lẻo):** Cho phép tất cả traffic (`from: []` trống).

---

### Bước 3: Áp dụng Policy chính xác
Khi đã xác định được file chính xác (ví dụ `policy-correct.yaml`), em chạy lệnh apply:
```bash
kubectl apply -f /root/<tên-file-đúng>.yaml
```
*(⚠️ Lưu ý: Tuyệt đối không xóa bất kỳ policy nào có sẵn trên cụm).*

---

## 🔍 Kiểm tra kết quả (Verification)

Xem danh sách NetworkPolicy đang hoạt động trong namespace `backend`:
```bash
kubectl get netpol -n backend
```
*Kết quả:* Chỉ hiển thị chính sách mạng chính xác vừa được em apply.
