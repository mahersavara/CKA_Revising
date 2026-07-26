# Nhật ký Thực hành Mock Exam 2 - Câu 10: Xử lý và Gỡ bỏ Helm Release chứa lỗ hổng

Tài liệu này lưu trữ quá trình tìm kiếm và gỡ bỏ thành công Helm Release `atlanta-page-apd` chứa ảnh lỗ hổng bảo mật `kodekloud/webapp-color:v1`.

---

## 💻 Các lệnh đã thực thi

1. **Dò tìm Pod/Deployment chứa ảnh lỗi `v1`:**
   ```bash
   kubectl get pods -A -o jsonpath='{range .items[*]}{.metadata.namespace}{"\t"}{.metadata.name}{"\t"}{range .spec.containers[*]}{.image}{"\t"}{end}{"\n"}{end}' | grep "v1"
   ```
   *Kết quả:* Phát hiện các Pod có tên `atlanta-page-apd-...` chạy ảnh lỗi `kodekloud/webapp-color:v1` trong namespace **`atlanta-page-04`**.

2. **Liệt kê Helm Release trong namespace `atlanta-page-04`:**
   ```bash
   helm list -n atlanta-page-04
   ```
   *Output:*
   ```text
   NAME                    NAMESPACE       REVISION        STATUS          CHART
   atlanta-page-apd        atlanta-page-04 1               deployed        atlanta-page-apd-0.1.0
   ```
   *(Nhận xét: Helm Release cần gỡ bỏ là `atlanta-page-apd`).*

3. **Gỡ bỏ Helm Release lỗi:**
   ```bash
   helm uninstall -n atlanta-page-04 atlanta-page-apd
   ```
   *Output:* `release "atlanta-page-apd" uninstalled`

4. **Xác nhận kết quả:**
   * Các Pod liên quan trong namespace `atlanta-page-04` sẽ được tự động xóa hoàn toàn khỏi cụm.
