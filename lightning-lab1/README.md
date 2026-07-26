# CKA Lightning Lab 1 - Cẩm Nang Ôn Luyện & Thực Hành

Chào mừng bạn đến với thư mục ôn luyện thực hành **Lightning Lab 1** cho kỳ thi **CKA (Certified Kubernetes Administrator)**!

Thư mục này đã được tối ưu hóa cấu trúc để giúp bạn dễ dàng tra cứu lý thuyết giải pháp nhanh (Guides) cũng như đối chiếu với nhật ký gõ lệnh thực tế (Logs) trên cụm lab KodeKloud.

---

## 📁 Cấu trúc thư mục (`lightning-lab1/`)

```text
lightning-lab1/
├── README.md                # Bản đồ hướng dẫn & Mục lục kết quả
├── guides/                  # Tài liệu hướng dẫn giải nhanh (Imperative Commands)
│   ├── 01_cluster_upgrade.md
│   ├── 02_deployment_query.md
│   ├── 03_kubeconfig_troubleshoot.md
│   ├── 04_deployment_rollout_upgrade.md
│   ├── 05_mysql_pvc_troubleshoot.md
│   ├── 06_etcd_backup_troubleshoot.md
│   ├── 07_secret_volume_pod.md
│   └── general_lab1_notes.md
└── logs/                    # Nhật ký gõ lệnh & Output terminal thực tế
    ├── 01_upgrade_log.md
    ├── 05_mysql_pvc_log.md
    ├── 06_etcd_backup_log.md
    └── 07_secret_pod_log.md
```

---

## 🎯 Chỉ mục các bài Lab & Tài liệu (100% Completed)

Dưới đây là liên kết nhanh đến tài liệu hướng dẫn và log thực hành của từng câu hỏi:

### 1. Nâng cấp Cụm (Cluster Upgrade)
* **Yêu cầu:** Nâng cấp cụm K8s v1.34 lên v1.35, drain node, xử lý Taint và chuyển dịch Pod.
* **Hướng dẫn giải:** [guides/01_cluster_upgrade.md](file:///f:/Work/ericodyssey/CKA_Revising/lightning-lab1/guides/01_cluster_upgrade.md)
* **Log thực hành:** [logs/01_upgrade_log.md](file:///f:/Work/ericodyssey/CKA_Revising/lightning-lab1/logs/01_upgrade_log.md)

### 2. Truy vấn Deployment (Custom Columns Query)
* **Yêu cầu:** Xuất thông tin Deployments theo dạng cột tùy biến, sắp xếp tăng dần theo tên.
* **Hướng dẫn giải:** [guides/02_deployment_query.md](file:///f:/Work/ericodyssey/CKA_Revising/lightning-lab1/guides/02_deployment_query.md)

### 3. Sửa lỗi kết nối (Troubleshoot Kubeconfig)
* **Yêu cầu:** Sửa file `admin.kubeconfig` bị sai cổng API Server.
* **Hướng dẫn giải:** [guides/03_kubeconfig_troubleshoot.md](file:///f:/Work/ericodyssey/CKA_Revising/lightning-lab1/guides/03_kubeconfig_troubleshoot.md)

### 4. Nâng cấp Deployment & Ghi chú (Rollout & Annotations)
* **Yêu cầu:** Nâng cấp Deployment từ `nginx:1.16` lên `nginx:1.17` và ghi nhận lịch sử thay đổi.
* **Hướng dẫn giải:** [guides/04_deployment_rollout_upgrade.md](file:///f:/Work/ericodyssey/CKA_Revising/lightning-lab1/guides/04_deployment_rollout_upgrade.md)

### 5. Sửa lỗi Storage của Deployment (PV/PVC Binding)
* **Yêu cầu:** Sửa lỗi Pod MySQL không khởi động được do lệch cấu hình PVC và lỗi `WaitForFirstConsumer`.
* **Hướng dẫn giải:** [guides/05_mysql_pvc_troubleshoot.md](file:///f:/Work/ericodyssey/CKA_Revising/lightning-lab1/guides/05_mysql_pvc_troubleshoot.md)
* **Log thực hành:** [logs/05_mysql_pvc_log.md](file:///f:/Work/ericodyssey/CKA_Revising/lightning-lab1/logs/05_mysql_pvc_log.md)

### 6. Sao lưu cơ sở dữ liệu (ETCD Backup)
* **Yêu cầu:** Sao lưu database ETCD bằng certs TLS và xác thực tính toàn vẹn của snapshot.
* **Hướng dẫn giải:** [guides/06_etcd_backup_troubleshoot.md](file:///f:/Work/ericodyssey/CKA_Revising/lightning-lab1/guides/06_etcd_backup_troubleshoot.md)
* **Log thực hành:** [logs/06_etcd_backup_log.md](file:///f:/Work/ericodyssey/CKA_Revising/lightning-lab1/logs/06_etcd_backup_log.md)

### 7. Mount Secret dạng ổ đĩa chỉ đọc (Secret Volume Pod)
* **Yêu cầu:** Tạo Pod mount một Secret có sẵn làm volume dạng read-only.
* **Hướng dẫn giải:** [guides/07_secret_volume_pod.md](file:///f:/Work/ericodyssey/CKA_Revising/lightning-lab1/guides/07_secret_volume_pod.md)
* **Log thực hành:** [logs/07_secret_pod_log.md](file:///f:/Work/ericodyssey/CKA_Revising/lightning-lab1/logs/07_secret_pod_log.md)

---
*Chúc bạn ôn luyện hiệu quả! Bất cứ lúc nào muốn tiếp tục, hãy nhắn thầy.*
