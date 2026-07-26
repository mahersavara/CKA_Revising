# Nhật ký Thực hành Mock Exam 3 - Câu 14: Xác định Pod Network CIDR của Cụm

Tài liệu này lưu trữ quá trình truy tìm dải mạng Pod Subnet từ kubeadm-config và ghi nhận thành công vào file `/root/pod-cidr.txt`.

---

## 💻 Các lệnh đã thực thi

1. **Truy vấn dải mạng Pod Subnet:**
   ```bash
   kubectl get configmap kubeadm-config -n kube-system -o yaml | grep -i podSubnet
   ```
   *Output thực tế:* `podSubnet: 172.17.0.0/16`

2. **Ghi kết quả ra file:**
   ```bash
   echo "172.17.0.0/16" > /root/pod-cidr.txt
   ```

3. **Xác nhận kết quả trong file:**
   ```bash
   cat /root/pod-cidr.txt
   ```
   *Output thực tế:*
   ```text
   172.17.0.0/16
   ```
   *(Nhận xét: Dải mạng Pod Subnet của cụm đã được ghi nhận chính xác).*
