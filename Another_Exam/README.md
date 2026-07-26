# 📖 Danh Sách Câu Hỏi Mô Phỏng & Bản Đồ Chuyên Đề CKA (CKAV10.0)

Chào mừng bạn đến với tài liệu ôn tập CKA nâng cao, được biên soạn chi tiết dựa trên đề thi thực tế **CKAV10.0 (SurePass, 83 câu hỏi mô phỏng)**.

Dưới đây là bảng ánh xạ chi tiết từng câu hỏi trong đề thi vào các chuyên đề ôn tập tương ứng. Mỗi chuyên đề đều đi kèm hướng dẫn giải chi tiết bằng tiếng Việt, phân tích các lỗi thường gặp trong phòng thi (typo/thiếu thông số) và cách kiểm tra kết quả chính xác nhất.

---

## 🗺️ Bản Đồ Chuyên Đề Ôn Luyện (17 Chuyên Đề)

| Chuyên đề ôn tập | Danh sách các câu hỏi trong đề thi |
| :--- | :--- |
| **[01. Đếm Node Ready](guides/01_node_status_and_counting.md)** | Câu 1, Câu 69 |
| **[02. Pod & Namespace Cơ Bản](guides/02_pod_and_namespace_basics.md)** | Câu 2, Câu 23, Câu 42, Câu 43, Câu 73 |
| **[03. JsonPath & Custom Columns](guides/03_jsonpath_and_custom_columns.md)** | Câu 4, Câu 7, Câu 8, Câu 12, Câu 21, Câu 25, Câu 30, Câu 33, Câu 60, Câu 61, Câu 67, Câu 74, Câu 79 |
| **[04. Multi-container & Init Pods](guides/04_multi_container_and_init_pods.md)** | Câu 10, Câu 16, Câu 35, Câu 36, Câu 48, Câu 71, Câu 80, Câu 83 |
| **[05. Sidecar Streaming & Ghi Log](guides/05_logging_sidecar_and_monitoring.md)** | Câu 13, Câu 14, Câu 27, Câu 37, Câu 63 |
| **[06. Bảo Trì Node (Drain & Cordon)](guides/06_node_maintenance_drain_cordon.md)** | Câu 53, Câu 78 |
| **[07. Nâng Cấp Master Node](guides/07_upgrade_control_plane_and_node.md)** | Câu 49 |
| **[08. Sao Lưu & Phục Hồi ETCD](guides/08_etcd_backup_and_restore.md)** | Câu 52, Câu 75 |
| **[09. Ingress, Services & DNS](guides/09_ingress_and_services.md)** | Câu 9, Câu 18, Câu 40, Câu 46, Câu 51, Câu 77 |
| **[10. Lưu Trữ PV, PVC & Volume Expansion](guides/10_storage_pvs_pvcs_expansion.md)** | Câu 5, Câu 44, Câu 45, Câu 57, Câu 81, Câu 82 |
| **[11. Quản Lý StorageClass](guides/11_storageclass_management.md)** | Câu 22 |
| **[12. RBAC & Service Accounts](guides/12_rbac_service_accounts.md)** | Câu 17 |
| **[13. Cấu Hình Network Policies](guides/13_network_policies.md)** | Câu 20, Câu 66, Câu 70 |
| **[14. Lập Lịch Pod (NodeSelector & Priority)](guides/14_pod_scheduling_and_priority.md)** | Câu 28, Câu 34, Câu 68 |
| **[15. Static Pods & DaemonSets](guides/15_static_pods_and_daemonsets.md)** | Câu 64, Câu 65 |
| **[16. Quản Lý Deployment & Helm](guides/16_deployment_management.md)** | Câu 15, Câu 24, Câu 26, Câu 29, Câu 38, Câu 41, Câu 54, Câu 58, Câu 76 |
| **[17. Sửa Lỗi Cụm (Troubleshooting & CRI)](guides/17_cluster_troubleshooting_and_cri.md)** | Câu 3, Câu 32, Câu 47, Câu 55, Câu 56, Câu 72 |

---

## ⚡ Lời Khuyên Khi Đi Thi CKA
1. **Thiết lập Alias & Autocomplete:** Chạy ngay các lệnh cấu hình trước khi làm bài để tăng tốc độ:
   ```bash
   alias k=kubectl
   complete -F __start_kubectl k
   export do="--dry-run=client -o yaml"
   ```
2. **Namespace:** Luôn kiểm tra namespace đề bài yêu cầu (`-n <namespace>`). 90% lỗi mất điểm trong kỳ thi CKA là do deploy tài nguyên vào nhầm namespace `default`.
3. **Sao lưu trước khi chỉnh sửa:** Với các bài cấu hình file tĩnh như `/etc/kubernetes/manifests/kube-apiserver.yaml` hay kubelet config, hãy copy ra một file `.bak` trước khi sửa. Nếu sai có thể phục hồi ngay lập tức để tránh làm sập cụm điều khiển (control plane).
