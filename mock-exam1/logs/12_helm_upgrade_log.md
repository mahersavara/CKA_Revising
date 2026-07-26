# Nhật ký Thực hành Mock Exam 1 - Câu 12: Nâng cấp Helm Release

Tài liệu này lưu trữ quá trình nâng cấp Helm Release `kk-mock1` lên phiên bản `6.11.2` thành công trong namespace `kk-ns`.

---

## 💻 Các lệnh đã thực thi

1. **Kiểm tra thông tin release ban đầu:**
   ```bash
   helm list -A
   ```
   *Output:* Release `kk-mock1` đang chạy bản chart `podinfo-6.11.0` (Revision 1).

2. **Kiểm tra danh sách repo:**
   ```bash
   helm repo list
   ```
   *Output:* Kho lưu trữ tên là `kk-mock1`.

3. **Cập nhật repo:**
   ```bash
   helm repo update
   ```

4. **Nâng cấp phiên bản Helm Chart (xử lý lỗi gõ sai tên repo):**
   * Lần 1: Chạy `helm upgrade kk-mock1 kkmock1/podinfo ...` -> Lỗi `repo kkmock1 not found`.
   * Lần 2: Chạy `helm upgrade kk-mock1 kkm-ock1/podinfo ...` -> Lỗi `repo kkm-ock1 not found`.
   * Lần 3 (Thành công): Gõ đúng tên repo `kk-mock1/podinfo`:
     ```bash
     helm upgrade kk-mock1 kk-mock1/podinfo --version 6.11.2 -n kk-ns
     ```
     *Output:*
     ```text
     Release "kk-mock1" has been upgraded. Happy Helming!
     REVISION: 2
     STATUS: deployed
     ```

5. **Xác nhận kết quả:**
   ```bash
   helm list -A
   ```
   *Output thực tế:*
   ```text
   NAME            NAMESPACE       REVISION        STATUS          CHART           
   kk-mock1        kk-ns           2               deployed        podinfo-6.11.2  
   ```
   *(Nhận xét: Revision đã tăng lên 2 và phiên bản chart được cập nhật chính xác thành podinfo-6.11.2).*
