# Lời giải câu hỏi: Lấy thông tin Deployments theo định dạng custom-columns

Đây là một dạng bài rất phổ biến trong đề thi CKA thực tế. Yêu cầu chính của bài này là trích xuất dữ liệu cụ thể từ các Deployment trong một Namespace, sắp xếp theo tên, và ghi ra file theo định dạng cột.

## 💡 Phương pháp tối ưu nhất: Dùng `-o custom-columns` kết hợp `--sort-by`

Trong `kubectl`, tham số `-o custom-columns` cực kỳ mạnh mẽ để định dạng bảng đầu ra theo đúng ý muốn mà không cần viết các lệnh ghép phức tạp.

### Lệnh hoàn chỉnh:
```bash
kubectl get deployments -n admin2406 \
  -o custom-columns="DEPLOYMENT:.metadata.name,CONTAINER_IMAGE:.spec.template.spec.containers[0].image,READY_REPLICAS:.status.readyReplicas,NAMESPACE:.metadata.namespace" \
  --sort-by=.metadata.name > /opt/admin2406_data
```

---

## 🔍 Phân tích chi tiết cú pháp lệnh:

1. **`kubectl get deployments -n admin2406`**: Lấy danh sách các deployment trong namespace `admin2406`.
2. **`-o custom-columns="..."`**: Định nghĩa các cột hiển thị:
   - **`DEPLOYMENT:.metadata.name`**: Cột thứ nhất tiêu đề `DEPLOYMENT`, giá trị lấy từ tên của deployment.
   - **`CONTAINER_IMAGE:.spec.template.spec.containers[0].image`**: Cột thứ hai tiêu đề `CONTAINER_IMAGE`, lấy image của container đầu tiên trong Pod template.
   - **`READY_REPLICAS:.status.readyReplicas`**: Cột thứ ba tiêu đề `READY_REPLICAS`, lấy số lượng replica đang Ready từ trường `.status.readyReplicas`. (Nếu trường này chưa có do replica = 0, nó sẽ hiện `<none>`).
   - **`NAMESPACE:.metadata.namespace`**: Cột thứ tư tiêu đề `NAMESPACE`, lấy tên namespace.
3. **`--sort-by=.metadata.name`**: Sắp xếp tăng dần theo tên của deployment (`.metadata.name`).
4. **`> /opt/admin2406_data`**: Ghi đè kết quả trực tiếp ra file yêu cầu `/opt/admin2406_data`.

---

## ⚠️ Lưu ý quan trọng khi thi (Gotchas):
* **Xử lý giá trị `<none>`**: Nếu một deployment mới tạo và chưa có replica nào sẵn sàng, `.status.readyReplicas` sẽ trả về `<none>`. Nếu đề bài yêu cầu hiển thị `0` thay vì `<none>` trong trường hợp không có ready replicas, ta có thể dùng giải pháp thay thế là lấy `.status.availableReplicas` hoặc dùng lệnh `awk`/`sed` để biến đổi, nhưng thông thường đề CKA chỉ kiểm tra định dạng cột chuẩn `custom-columns` nên lệnh trên là đủ để pass 100% điểm.
* **Nhiều Container**: Trường `.spec.template.spec.containers[0].image` chỉ lấy container đầu tiên. Nếu deployment chạy nhiều container (multi-container pod), ta có thể dùng `.spec.template.spec.containers[*].image` để lấy hết tất cả image (ngăn cách bởi dấu phẩy). Tuy nhiên trong các bài lab CKA thông thường chỉ có 1 container chính.
