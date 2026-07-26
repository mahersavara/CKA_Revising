# Chuyên đề 10: Lưu Trữ CKA - PV, PVC, Co-located Pods và Mở Rộng Dung Lượng (Câu 5, 44, 45, 57, 81, 82)

Quản lý lưu trữ bền vững (Storage) là một trong những phần thi dài và dễ sai sót nhất trong CKA. Chuyên đề này tổng hợp các bài toán liên quan đến tạo PersistentVolume (PV), PersistentVolumeClaim (PVC), liên kết (binding) PVC với Pod, sắp xếp PV, mở rộng dung lượng PVC (Volume Expansion) và cấu hình Volume tạm thời (`emptyDir`).

---

## 💾 1. Tạo PersistentVolume (PV) (Câu 5, 81)

PV là tài nguyên lưu trữ cấp độ cụm (cluster-level). Bạn không thể tạo PV bằng các lệnh CLI nhanh (imperative), bắt buộc phải viết YAML.

### Mẫu PV HostPath 1Gi - ReadOnlyMany (Câu 5)
*Lưu ý từ đề thi:* Đề bài yêu cầu tên `app-data` và đường dẫn `/srv/app-data`. Tuy nhiên đáp án SurePass lại viết `app-config` và `/srv/app-config`. Đi thi thực tế, bạn **bắt buộc** phải tuân thủ 100% tên và đường dẫn trong đề bài yêu cầu.

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: app-data                     # 👈 Tên PV (đúng đề bài)
spec:
  capacity:
    storage: 1Gi
  accessModes:
    - ReadOnlyMany                   # Chế độ chỉ đọc, nhiều node gắn kết
  hostPath:
    path: /srv/app-data              # 👈 Đường dẫn thực tế trên Host (đúng đề bài)
```
*Lệnh tạo:* `kubectl create -f pv.yaml`

---

### Mẫu PV HostPath 2Gi - ReadWriteMany có StorageClass (Câu 81)
```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: app-data
spec:
  capacity:
    storage: 2Gi
  accessModes:
    - ReadWriteMany                  # Đọc-Ghi bởi nhiều node
  storageClassName: shared           # 👈 Tên StorageClass liên kết
  hostPath:
    path: /srv/app-data
```

---

## 📈 2. Tạo PVC, Gắn vào Pod & Mở rộng Dung lượng (Câu 44)

**Đề bài:** 
1. Tạo PVC tên `pv-volume` dùng StorageClass `csi-hostpath-sc` với dung lượng `10Mi`, accessMode `ReadWriteOnce`.
2. Tạo Pod tên `web-server` chạy image `nginx` mount PVC này vào thư mục `/usr/share/nginx/html`.
3. Thay đổi dung lượng PVC lên `70Mi` và ghi nhận lịch sử thay đổi (record).

### Bước 1: Tạo PVC `pvc.yaml`
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pv-volume
spec:
  storageClassName: csi-hostpath-sc
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Mi
```
*Lệnh tạo:* `kubectl apply -f pvc.yaml`

### Bước 2: Tạo Pod `pod-pvc.yaml` gắn kết với PVC
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: web-server
spec:
  containers:
  - name: web-server
    image: nginx
    volumeMounts:
    - mountPath: "/usr/share/nginx/html"
      name: my-volume
  volumes:
  - name: my-volume
    persistentVolumeClaim:
      claimName: pv-volume           # 👈 Trỏ tới PVC đã tạo ở trên
```
*Lệnh tạo:* `kubectl apply -f pod-pvc.yaml`

### Bước 3: Mở rộng dung lượng PVC lên 70Mi
Để mở rộng dung lượng PVC trực tiếp (Resizing) và ghi nhận lịch sử thay đổi, sử dụng lệnh edit với cờ `--record`:
```bash
kubectl edit pvc pv-volume --record
```
Trong cửa sổ chỉnh sửa cấu hình, tìm dòng `storage: 10Mi` và sửa thành:
```yaml
spec:
  resources:
    requests:
      storage: 70Mi                  # 👈 Cập nhật lên 70Mi
```
Lưu lại và thoát ra. Hệ thống sẽ tự động cập nhật dung lượng PVC trên nền mà không cần khởi động lại Pod (nhờ tính năng mở rộng dung lượng của StorageClass `csi-hostpath-sc`).

---

## 🗂️ 3. Liệt kê PV sắp xếp theo dung lượng (Câu 45)

**Đề bài:** Liệt kê toàn bộ PersistentVolumes sắp xếp theo dung lượng chứa, lưu kết quả thô vào file `/opt/KUCC00102/volume_list`.

**Giải pháp:** Sử dụng cờ `--sort-by` trỏ đến trường dung lượng lưu trữ của PV:
```bash
kubectl get pv --sort-by=.spec.capacity.storage > /opt/KUCC00102/volume_list
```

---

## 🛠️ 4. Phục hồi MariaDB Deployment dùng PV Retained (Câu 57)

**Đề bài:** Phục hồi MariaDB Deployment bị xóa nhầm trong namespace `mariadb`. Bạn phải tạo một PVC tên `mariadb` (ReadWriteOnce, dung lượng `250Mi`) để tự động liên kết với một PV có sẵn ở trạng thái Retained, sau đó sửa file cấu hình `~/mariadb-deployment.yaml` trỏ tới PVC này rồi chạy.

### Bước 1: Tạo PVC `mariadb`
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mariadb
  namespace: mariadb
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 250Mi
```
*Lệnh tạo:* `kubectl apply -f pvc-mariadb.yaml`
*(PVC này sẽ tự động bind với PV Retained duy nhất còn trống trong hệ thống).*

### Bước 2: Sửa và chạy Deployment
Mở file `~/mariadb-deployment.yaml`, tìm phần `volumes` và trỏ `claimName` tới PVC `mariadb`:
```yaml
spec:
  template:
    spec:
      containers:
      - name: mariadb
        image: mariadb
        ...
      volumes:
      - name: mariadb-storage
        persistentVolumeClaim:
          claimName: mariadb        # 👈 Sửa ở đây
```
Chạy lệnh apply để deploy lại ứng dụng:
```bash
kubectl apply -f ~/mariadb-deployment.yaml
```

---

## ⚡ 5. Khai báo Ổ đĩa tạm thời emptyDir (Câu 82)

**Đề bài:** Tạo Pod tên `non-persistent-redis` trong namespace `staging`, image `redis`. Gắn ổ đĩa không bền vững (non-persistent) tên `cache-control` mount tại `/data/redis`.

**Giải pháp:** Ổ đĩa không bền vững trong Kubernetes được định nghĩa bằng loại volume `emptyDir: {}`. Ổ đĩa này sẽ tồn tại song hành cùng vòng đời của Pod (bị xóa sạch khi Pod bị xóa).

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: non-persistent-redis
  namespace: staging
spec:
  containers:
  - name: redis
    image: redis
    volumeMounts:
    - mountPath: /data/redis
      name: cache-control
  volumes:
  - name: cache-control
    emptyDir: {}                     # 👈 Sử dụng emptyDir
```
*Lệnh tạo:* `kubectl apply -f redis-pod.yaml`
