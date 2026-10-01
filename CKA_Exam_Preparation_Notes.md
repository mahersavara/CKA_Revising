# Certified Kubernetes Administrator (CKA) - Exam Preparation & Technical Insights

> **Thí sinh:** KHUAT DINH LINH  
> **Ngày thi:** Thứ 7, ngày 08/08/2026  
> **Giờ thi chính thức:** 09:00:00 AM (Múi giờ Asia/Bangkok - GMT+7)  
> **Thời gian Check-in:** 08:30:00 AM  
> **Môi trường thi:** Online Proctored (PSI Secure Browser + XFCE Remote Desktop)

---

## 📅 1. Mốc Thời Gian Quan Trọng (Critical Milestones)

| Thời gian | Sự kiện / Hành động bắt buộc |
| :--- | :--- |
| **Trước 09:00 AM - 07/08/2026** *(24h trước thi)* | **Hạn chót Đổi/Hủy lịch:** Phải Cancel/Reschedule trước mốc này. Sau 09:00 AM ngày 07/08 sẽ bị khóa và mất phí/mất lượt thi lại nếu không tham gia. |
| **Trước 06:30 AM - 08/08/2026** *(2.5h trước thi)* | **Hạn chót làm Tutorial Test:** Nút Launch Tutorial Test sẽ **tự động hết hạn** trước giờ thi 150 phút. *(Khuyên làm ngay từ ngày 05/08 - 07/08)*. |
| **08:30 AM - 08/08/2026** *(30p trước thi)* | **Hệ thống mở Check-in:** Bắt đầu truy cập portal, mở PSI Secure Browser, quét camera phòng thi và xác minh ID. |
| **09:00 AM - 08/08/2026** | **Bắt đầu làm bài thi CKA (120 phút)** $\rightarrow$ Kết thúc lúc 11:00 AM. |

---

## 🖥️ 2. Môi Trường Thi Remote Desktop (XFCE) & Killer.sh Insights

### Điểm khác biệt giữa Giả lập (killer.sh) và Thi thật
* **XFCE Remote Desktop:** Cả giả lập và thi thật đều dùng máy ảo XFCE trên trình duyệt (thay vì terminal đơn thuần). Thao tác Copy & Paste có sự khác biệt về phím tắt.
* **Hạn chế URL:** Thi thật chỉ được mở 4 domain cho phép trong Firefox. Giả lập mở được web ngoài.
* **Phân chia Instance:** 
  * Thi thật: Mỗi câu hỏi chạy trên instance/context sạch riêng biệt.
  * Giả lập: Nhiều câu chạy chung trên 1 cluster. (Nếu hỏng cluster trong giả lập $\rightarrow$ dùng nút Restart).

### Các URL ĐƯỢC PHÉP truy cập trong bài thi
1. `https://kubernetes.io/docs`
2. `https://kubernetes.io/blog`
3. `https://helm.sh/docs`
4. `https://gateway-api.sigs.k8s.io`

---

## 🛠️ 3. Quy Tắc Kỹ Thuật & Thao Tác Thực Hành (Technical Tips)

### 🔴 Quy tắc SSH chuyển Node (Bắt buộc nhớ)
* Mỗi câu hỏi cần SSH tới một node cụ thể.
* **Quy trình chuẩn cho mọi câu hỏi:**
  1. Gõ `exit` để thoát về `candidate@terminal` chính.
  2. Chuyển context theo đề bài (`kubectl config use-context ...`).
  3. SSH tới node mục tiêu (`ssh <node-name>`).
  * *Lưu ý:* Tránh trường hợp SSH lồng SSH làm sai môi trường thực thi.

### 📝 Công cụ chỉnh sửa (VSCodium & Mousepad)
* **VSCodium:** Có sẵn trên máy ảo XFCE. Rất hữu ích để sửa file YAML dài hoặc phức tạp nếu không quen xài `vim`. *(Cấm cài extension thêm)*.
* **Mousepad:** (`Applications -> Accessories -> Mousepad`) Dùng để làm sổ nháp thông tin tạm thời.

### 🔑 Quyền Root
* Dùng lệnh `sudo -i` khi cần can thiệp file cấu hình hệ thống (`/etc/kubernetes/manifests`, `kubelet`, `etcd`, v.v.).

### ⌨️ Lỗi Bàn phím & Chuyển đổi ngôn ngữ
* **macOS:** Chuyển Input Source về chuẩn **English -> ABC (Default)**.
* **Windows:** Chuyển layout bàn phím về **English (US)**.
* **Ubuntu + Chrome:** Nếu kẹt phím, đổi sang **Firefox** hoặc **Chromium** và bật chế độ Incognito/Private.

---

## 🚫 4. Quy Định Phòng Thi & Yêu Cầu Thiết Bị (PSI Regulations)

### Thiết bị & Hệ điều hành
* **Hệ điều hành:** Windows 10+, macOS 13 (Ventura)+, hoặc Ubuntu 20+.
* **Tài khoản Admin:** Phải dùng tài khoản Administrator của máy cá nhân. KHÔNG dùng máy công ty (dễ bị phần mềm bảo mật/MDM chặn PSI Secure Browser).
* **CẤM DÙNG TAI NGHE (Strict Headset Prohibition):** 
  * Cấm tuyệt đối tai nghe Bluetooth, Earbuds, AirPods, tai nghe có dây.
  * **Phải dùng Loa ngoài (Speakers) và Microphone tích hợp/rời.**

### Quy định Phòng thi & Check-in (Clean Desk)
* **Bàn làm việc:** Dọn sạch hoàn toàn sách vở, giấy nốt, màn hình phụ (rút nguồn), hộp khăn giấy.
* **Nước uống:** Chỉ để ly/chai **trong suốt không nhãn mác/chữ**.
* **Phòng thi:** Khép kín, riêng tư, đủ ánh sáng, không có người qua lại hay tiếng ồn.
* **Giấy tờ tùy thân (ID):** Hộ chiếu (Passport) hoặc CCCD còn hạn. Tên trên ID phải đúng chính xác **KHUAT DINH LINH** (có ảnh + chữ ký).

---

## 📋 5. Kịch Bản Ngày Thi (Thứ 7, 08/08/2026)

* **08:15 AM:** Ăn sáng nhẹ, đi vệ sinh, rửa mặt tỉnh táo, chuẩn bị ly nước trong suốt, cất tai nghe khỏi khu vực thi.
* **08:30 AM:** Đăng nhập portal $\rightarrow$ Bấm **"Launch Exam"** $\rightarrow$ Tải/mở PSI Secure Browser.
* **08:30 – 08:55 AM:** Làm Self Check-in (Chụp ID, quét camera 360 độ quanh phòng, kiểm tra loa/mic) $\rightarrow$ Chờ Proctor xác minh.
* **09:00 AM:** Bắt đầu tính giờ 120 phút làm bài thi CKA!
