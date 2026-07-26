# Chuyên đề 16: Quản Lý Deployment - Scale, Rollout, HPA, Helm và Resource Tuning (Câu 15, 24, 26, 29, 38, 41, 54, 58, 76)

Deployment là tài nguyên phổ biến nhất để chạy ứng dụng dạng stateless trong Kubernetes. Chuyên đề này tổng hợp các thao tác quản trị Deployment nâng cao: thay đổi số lượng replicas (Scaling), nâng cấp phiên bản không gián đoạn (Rolling Update), phục hồi phiên bản cũ (Rollout Undo), tự động co giãn (HPA) với tham số stabilization, điều chỉnh tài nguyên công bằng (Resource Tuning) và kết hợp xuất Helm template.

---

## ⚡ 1. Thay đổi số lượng Replicas (Scaling) (Câu 26, 29, 54)

Sử dụng lệnh `kubectl scale` để thay đổi số lượng Pod nhanh chóng:
```bash
# Câu 26: Scale webserver lên 3 pods
kubectl scale deployment webserver --replicas=3 -n <namespace>

# Câu 29: Scale presentation lên 6 pods
kubectl scale deployment presentation --replicas=6 -n <namespace>

# Câu 54: Scale webserver lên 6 pods
kubectl scale deployment webserver --replicas=6 -n <namespace>
```

---

## 🔄 2. Cập nhật Phiên bản & Rollback (Câu 76)

**Đề bài:** Tạo deployment `nginx-app` (nginx:1.11.10-alpine, 3 replicas). Thực hiện nâng cấp lên `nginx:1.11.13-alpine` bằng cơ chế Rolling Update và ghi nhận lịch sử (record). Sau đó rollback về phiên bản cũ.

### Bước 1: Tạo Deployment ban đầu
```bash
kubectl create deployment nginx-app --image=nginx:1.11.10-alpine --replicas=3
```

### Bước 2: Nâng cấp image (Rolling Update) có ghi nhận lịch sử
```bash
kubectl set image deployment/nginx-app nginx=nginx:1.11.13-alpine --record
```
*Lưu ý:* Cờ `--record` giúp ghi lại câu lệnh đã chạy vào lịch sử rollout (rollout history).

### Bước 3: Kiểm tra trạng thái Rollout
```bash
kubectl rollout status deployment/nginx-app
kubectl rollout history deployment/nginx-app
```

### Bước 4: Khôi phục phiên bản trước đó (Rollback)
```bash
kubectl rollout undo deployment/nginx-app
```

---

## 📄 3. Xuất file Spec Deployment & Dọn dẹp Tài nguyên (Câu 41)

**Đề bài:** Tạo file cấu hình Deployment tên `kual00201` chạy 7 replicas image `nginx`, nhãn của Pod là `app_runtime_stage=dev`. Lưu file spec tại `/opt/KUAL00201/spec_deployment.yaml`. Khi hoàn thành, phải dọn dẹp (xóa) mọi đối tượng API đã sinh ra trong quá trình làm bài.

### Bước 1: Xuất file Spec mẫu
```bash
kubectl create deployment kual00201 --image=nginx --replicas=7 --dry-run=client -o yaml > /opt/KUAL00201/spec_deployment.yaml
```

### Bước 2: Sửa đổi file cấu hình để khớp Nhãn (Labels) đề bài
Mặc định `kubectl create deploy` sẽ tạo nhãn `app=kual00201`. Ta phải mở file `/opt/KUAL00201/spec_deployment.yaml` ra sửa lại tất cả các nhãn thành `app_runtime_stage: dev`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kual00201
  labels:
    app_runtime_stage: dev           # 👈 Sửa ở đây
spec:
  replicas: 7
  selector:
    matchLabels:
      app_runtime_stage: dev         # 👈 Sửa ở đây
  template:
    metadata:
      labels:
        app_runtime_stage: dev       # 👈 Sửa ở đây
    spec:
      containers:
      - name: nginx
        image: nginx
```

### Bước 3: Dọn dẹp tài nguyên
Vì đề bài yêu cầu "clean up (delete) any new Kubernetes API object", nếu bạn chỉ dùng cờ `--dry-run=client` thì thực tế chưa có tài nguyên nào được tạo trên cluster, do đó bạn không cần xóa gì. Nếu bạn đã lỡ chạy lệnh `apply`, hãy xóa nó đi:
```bash
kubectl delete deployment kual00201
```

---

## 📉 4. Cấu hình HorizontalPodAutoscaler (HPA) Nâng cao (Câu 24)

**Đề bài:** Tạo HPA tên `apache-server` trong namespace `autoscale` để giám sát Deployment `apache-server`. Target 50% CPU, min 1 Pod, max 4 Pods. Cấu hình thời gian trễ khi scale down (downscale stabilization window) là 30 giây.

### Giải pháp:
Từ Kubernetes v1.23+, cấu hình `behavior` cho HPA đã được chuẩn hóa trong API `autoscaling/v2`.

1. **Xuất file mẫu YAML:**
   ```bash
   kubectl autoscale deployment apache-server --cpu-percent=50 --min=1 --max=4 -n autoscale --dry-run=client -o yaml > hpa.yaml
   ```
2. **Sửa đổi file `hpa.yaml` để thêm `behavior`:**
   ```yaml
   apiVersion: autoscaling/v2
   kind: HorizontalPodAutoscaler
   metadata:
     name: apache-server
     namespace: autoscale
   spec:
     scaleTargetRef:
       apiVersion: apps/v1
       kind: Deployment
       name: apache-server
     minReplicas: 1
     maxReplicas: 4
     metrics:
     - type: Resource
       resource:
         name: cpu
         target:
           type: Utilization
           averageUtilization: 50
     behavior:                          # 👈 Thêm phần cấu hình trễ scale down
       scaleDown:
         stabilizationWindowSeconds: 30 # 👈 30 giây trễ ổn định
   ```
3. **Áp dụng:** `kubectl apply -f hpa.yaml`

---

## ⚖️ 5. Chia tài nguyên công bằng - Resource Tuning (Câu 38)

**Đề bài:** Một ứng dụng WordPress trong namespace `relative-fawn` đang chạy 3 replicas nhưng bị lỗi do yêu cầu tài nguyên (resource requests) quá lớn. Bạn cần điều chỉnh yêu cầu tài nguyên này bằng cách lấy tổng tài nguyên khả dụng của Node chia đều cho 3 Pod.

### Cách giải quyết:
1. **Kiểm tra tài nguyên khả dụng của Node (Allocatable):**
   ```bash
   kubectl describe node <tên-node-chạy-pod>
   ```
   Xem phần `Allocatable` (ví dụ: `cpu: 2`, `memory: 8Gi`).
2. **Tính toán phần chia đều (Fair share):**
   * CPU: `2 CPU / 3 Pods = 0.66 CPU` -> cấu hình `600m` hoặc `650m` cho an toàn (chừa lại một chút cho OS/Kubelet).
   * Memory: `8Gi / 3 Pods = 2.66 Gi` -> cấu hình `2.5Gi` hoặc `2500Mi`.
3. **Cập nhật Deployment:**
   ```bash
   kubectl edit deployment wordpress -n relative-fawn
   ```
   Sửa phần `resources.requests`:
   ```yaml
   spec:
     template:
       spec:
         containers:
         - name: wordpress
           resources:
             requests:
               cpu: "600m"          # 👈 Điền thông số đã chia đều
               memory: "2.5Gi"       # 👈 Điền thông số đã chia đều
   ```

---

## ☸️ 6. Xuất cấu hình ứng dụng từ Helm Template (Câu 58)

**Đề bài:** Thêm Helm repository của Argo CD tên là `argo`. Sinh file manifest cài đặt từ Helm chart phiên bản `7.7.3` cho namespace `argocd` và lưu tại `~/argo-helm.yaml`. Cấu hình không tự động cài đặt các CRD.

### Các bước thực hiện:
```bash
# 1. Thêm repo và update
helm repo add argo https://argoproj.github.io/argo-helm
helm repo update

# 2. Sinh template lưu ra file với tham số chặn CRD
helm template argocd argo/argo-cd \
  --version 7.7.3 \
  --namespace argocd \
  --set crds.install=false > ~/argo-helm.yaml
```
*(Lưu ý: lệnh `helm template` chỉ biên dịch và tạo cấu trúc manifest YAML thô ra file chứ không cài đặt trực tiếp lên cluster).*
