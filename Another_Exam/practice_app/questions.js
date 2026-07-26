const archetypes = [
  {
    id: 1,
    category: "Node Management",
    title: "Đếm số lượng Node Ready Schedulable",
    context: "k8s-master-0",
    description: "Hãy kiểm tra xem có bao nhiêu Node ở trạng thái Ready và không bị gán taints NoSchedule. Ghi số lượng đó vào file `/opt/KUCC00104/kucc00104.txt`.",
    difficulty: "Dễ",
    weight: "4%",
    taskRequirements: [
      "Context yêu cầu: k8s-master-0 (Bắt buộc gõ chuyển context trước).",
      "Kiểm tra trạng thái Ready của các Node.",
      "Kiểm tra xem Node nào có taints dạng NoSchedule.",
      "Ghi con số kết quả (ví dụ: '2') vào file /opt/KUCC00104/kucc00104.txt."
    ],
    sampleAnswers: [
      "kubectl config use-context k8s-master-0",
      "kubectl get nodes -o custom-columns=NAME:.metadata.name,TAINTS:.spec.taints",
      "echo \"2\" > /opt/KUCC00104/kucc00104.txt"
    ],
    breakdown: [
      {
        cmd: "kubectl config use-context k8s-master-0",
        explain: [
          "kubectl config use-context k8s-master-0: Chuyển sang ngữ cảnh quản trị cụm đích của câu hỏi."
        ]
      },
      {
        cmd: "kubectl get nodes -o custom-columns=NAME:.metadata.name,TAINTS:.spec.taints",
        explain: [
          "kubectl get nodes: Lấy thông tin danh sách các Node trong cụm.",
          "-o custom-columns=...: Tùy chỉnh các cột dữ liệu hiển thị.",
          "NAME:.metadata.name: Tạo cột NAME với dữ liệu lấy từ đường dẫn JSON '.metadata.name' (tên Node).",
          "TAINTS:.spec.taints: Tạo cột TAINTS trích xuất trường '.spec.taints' để quét tìm taint cản trở lập lịch (NoSchedule)."
        ]
      },
      {
        cmd: "echo \"2\" > /opt/KUCC00104/kucc00104.txt",
        explain: [
          "echo \"2\": In con số kết quả 2 ra màn hình.",
          "> /opt/KUCC00104/kucc00104.txt: Ký tự redirect '>' giúp ghi đè con số 2 vào đúng đường dẫn file yêu cầu."
        ]
      }
    ],
    validate: (history, files) => {
      const hasChecked = history.some(cmd => cmd.includes("get nodes") || cmd.includes("describe nodes"));
      const hasWritten = history.some(cmd => /echo\s+["']?\d+["']?\s*>\s*\/opt\/KUCC00104\/kucc00104\.txt/.test(cmd));
      if (!hasChecked) return { success: false, msg: "Bạn chưa chạy lệnh kiểm tra các Node (kubectl get nodes / describe nodes)." };
      if (!hasWritten) return { success: false, msg: "Bạn chưa chạy lệnh ghi số lượng Node vào file chỉ định." };
      return { success: true, msg: "Tuyệt vời! Bạn đã kiểm tra Node và ghi kết quả đúng cú pháp." };
    }
  },
  {
    id: 2,
    category: "Pod & Namespace",
    title: "Tạo Namespace & Chạy Pod",
    context: "k8s",
    description: "Tạo một namespace mới tên là `development`. Sau đó, tạo một Pod chạy image `nginx` lấy tên là `nginx` chạy trong namespace mới tạo đó.",
    difficulty: "Dễ",
    weight: "3%",
    taskRequirements: [
      "Context yêu cầu: k8s",
      "Tạo namespace development.",
      "Tạo Pod nginx trong namespace development."
    ],
    sampleAnswers: [
      "kubectl config use-context k8s",
      "kubectl create namespace development",
      "kubectl run nginx --image=nginx -n development"
    ],
    breakdown: [
      {
        cmd: "kubectl create namespace development",
        explain: [
          "kubectl create namespace development: Lệnh tạo ra một phân vùng tài nguyên (namespace) mới tên là 'development' để cô lập với các tài nguyên khác."
        ]
      },
      {
        cmd: "kubectl run nginx --image=nginx -n development",
        explain: [
          "kubectl run nginx: Chạy một Pod đơn lẻ và đặt tên Pod là 'nginx'.",
          "--image=nginx: Tải và khởi chạy container bằng image nginx từ Docker Hub.",
          "-n development: (hoặc --namespace=development) Chỉ định triển khai Pod trực tiếp vào namespace 'development' vừa tạo."
        ]
      }
    ],
    validate: (history, files) => {
      const hasNs = history.some(cmd => cmd.includes("create namespace development") || cmd.includes("create ns development"));
      const hasPod = history.some(cmd => /run\s+nginx/.test(cmd) && /--image=nginx/.test(cmd) && /-n\s+development|--namespace=development/.test(cmd));
      if (!hasNs) return { success: false, msg: "Thiếu lệnh tạo namespace 'development'." };
      if (!hasPod) return { success: false, msg: "Thiếu lệnh chạy Pod nginx với image nginx trong namespace development." };
      return { success: true, msg: "Hoàn hảo! Namespace và Pod nginx đã được tạo chính xác." };
    }
  },
  {
    id: 3,
    category: "JsonPath & Custom Columns",
    title: "Định dạng danh sách Pod (Custom Columns)",
    context: "k8s-master-0",
    description: "Liệt kê toàn bộ các Pod trong namespace hiện tại với 2 cột tùy chỉnh: cột thứ nhất là `POD_NAME` chứa tên Pod, cột thứ hai là `POD_STATUS` chứa trạng thái của Container (status.containerStatuses[].state hoặc status.phase).",
    difficulty: "Trung bình",
    weight: "4%",
    taskRequirements: [
      "Context yêu cầu: k8s-master-0",
      "Sử dụng tham số custom-columns để định dạng đầu ra.",
      "Cột thứ nhất đặt tên là POD_NAME lấy từ .metadata.name.",
      "Cột thứ hai đặt tên là POD_STATUS lấy từ .status.phase hoặc .status.containerStatuses[].state."
    ],
    sampleAnswers: [
      "kubectl get pods -o=custom-columns=\"POD_NAME:.metadata.name,POD_STATUS:.status.phase\""
    ],
    breakdown: [
      {
        cmd: "kubectl get pods -o=custom-columns=\"POD_NAME:.metadata.name,POD_STATUS:.status.phase\"",
        explain: [
          "kubectl get pods: Lấy danh sách các Pod trong namespace hiện tại.",
          "-o=custom-columns=...: Chỉ định xuất dữ liệu ra dạng bảng tùy chỉnh cột.",
          "POD_NAME:.metadata.name: Khai báo cột đầu tên là POD_NAME, lấy giá trị từ trường metadata.name của Pod.",
          "POD_STATUS:.status.phase: Khai báo cột thứ hai tên là POD_STATUS, hiển thị vòng đời trạng thái của Pod (như Running, Pending)."
        ]
      }
    ],
    validate: (history, files) => {
      const hasCmd = history.some(cmd => 
        cmd.includes("get pod") && 
        cmd.includes("custom-columns") && 
        cmd.includes("POD_NAME") && 
        cmd.includes("POD_STATUS")
      );
      if (!hasCmd) return { success: false, msg: "Lệnh của bạn phải chứa cấu hình -o=custom-columns với 2 tên cột POD_NAME và POD_STATUS." };
      return { success: true, msg: "Chính xác! Bạn đã định dạng custom-columns đúng chuẩn." };
    }
  },
  {
    id: 4,
    category: "JsonPath & Custom Columns",
    title: "Lọc Địa chỉ IP của Pod bằng JsonPath",
    context: "k8s",
    description: "Hãy sử dụng biểu thức JsonPath để trích xuất trực tiếp địa chỉ IP của Pod có tên `nginx-dev` và hiển thị ra màn hình.",
    difficulty: "Trung bình",
    weight: "3%",
    taskRequirements: [
      "Context yêu cầu: k8s",
      "Không dùng describe.",
      "Sử dụng -o jsonpath trỏ tới .status.podIP của Pod nginx-dev."
    ],
    sampleAnswers: [
      "kubectl get pod nginx-dev -o jsonpath='{.status.podIP}'"
    ],
    breakdown: [
      {
        cmd: "kubectl get pod nginx-dev -o jsonpath='{.status.podIP}'",
        explain: [
          "kubectl get pod nginx-dev: Truy vấn thông tin Pod 'nginx-dev'.",
          "-o jsonpath='...': Định dạng đầu ra chỉ lấy dữ liệu được lọc qua biểu thức JsonPath.",
          "{.status.podIP}: Đường dẫn JSON trích xuất địa chỉ IP nội bộ của Pod từ trường status.podIP."
        ]
      }
    ],
    validate: (history, files) => {
      const hasCmd = history.some(cmd => 
        cmd.includes("get pod") && 
        cmd.includes("nginx-dev") && 
        (cmd.includes("jsonpath") || cmd.includes("jsonpath")) &&
        cmd.includes(".status.podIP")
      );
      if (!hasCmd) return { success: false, msg: "Thiếu lệnh lấy podIP bằng jsonpath cho Pod nginx-dev." };
      return { success: true, msg: "Rất tốt! Lệnh của bạn trích xuất đúng trường .status.podIP." };
    }
  },
  {
    id: 5,
    category: "RBAC",
    title: "Tạo ClusterRole & Gắn quyền giới hạn Namespace",
    context: "k8s",
    description: "Tạo một ClusterRole tên là `deployment-clusterrole` chỉ cho phép quyền `create` đối với các tài nguyên: `Deployment`, `StatefulSet`, `DaemonSet`. Tạo một ServiceAccount tên `cicd-token` trong namespace `app-team1`. Cuối cùng, liên kết ClusterRole này với ServiceAccount trên bằng một RoleBinding giới hạn trong namespace `app-team1`.",
    difficulty: "Khó",
    weight: "7%",
    taskRequirements: [
      "Context yêu cầu: k8s",
      "Tạo ClusterRole deployment-clusterrole có quyền create deployments, statefulsets, daemonsets.",
      "Tạo ServiceAccount cicd-token trong namespace app-team1.",
      "Tạo RoleBinding (không dùng ClusterRoleBinding) trong namespace app-team1 để giới hạn quyền hạn."
    ],
    sampleAnswers: [
      "kubectl create clusterrole deployment-clusterrole --verb=create --resource=deployments,statefulsets,daemonsets",
      "kubectl create serviceaccount cicd-token -n app-team1",
      "kubectl create rolebinding deployment-clusterrole-binding --clusterrole=deployment-clusterrole --serviceaccount=app-team1:cicd-token -n app-team1"
    ],
    breakdown: [
      {
        cmd: "kubectl create clusterrole deployment-clusterrole --verb=create --resource=deployments,statefulsets,daemonsets",
        explain: [
          "kubectl create clusterrole deployment-clusterrole: Khởi tạo một ClusterRole cấp độ cụm tên là 'deployment-clusterrole'.",
          "--verb=create: Gán quyền thực thi hành động 'create' (tạo mới).",
          "--resource=deployments,statefulsets,daemonsets: Danh sách tài nguyên được gán quyền (viết dạng số nhiều, ngăn cách bằng dấu phẩy không khoảng trắng)."
        ]
      },
      {
        cmd: "kubectl create serviceaccount cicd-token -n app-team1",
        explain: [
          "kubectl create serviceaccount cicd-token: Tạo một ServiceAccount đại diện định danh cho Pod tên 'cicd-token'.",
          "-n app-team1: Đặt ServiceAccount trong namespace 'app-team1'."
        ]
      },
      {
        cmd: "kubectl create rolebinding deployment-clusterrole-binding --clusterrole=deployment-clusterrole --serviceaccount=app-team1:cicd-token -n app-team1",
        explain: [
          "kubectl create rolebinding...: Khởi tạo một RoleBinding giới hạn phạm vi namespace (thay vì ClusterRoleBinding).",
          "--clusterrole=deployment-clusterrole: Chỉ định liên kết với vai trò ClusterRole đã tạo ở bước 1.",
          "--serviceaccount=app-team1:cicd-token: Trỏ đích danh tới ServiceAccount thuộc namespace app-team1 nhận quyền.",
          "-n app-team1: Ràng buộc quyền hạn của ClusterRole chỉ có hiệu lực bên trong namespace 'app-team1'."
        ]
      }
    ],
    validate: (history, files) => {
      const cr = history.some(cmd => cmd.includes("create clusterrole deployment-clusterrole") && cmd.includes("create") && cmd.includes("deployments"));
      const sa = history.some(cmd => cmd.includes("create serviceaccount cicd-token") && (cmd.includes("-n app-team1") || cmd.includes("--namespace=app-team1")));
      const rb = history.some(cmd => 
        cmd.includes("create rolebinding") && 
        cmd.includes("deployment-clusterrole") && 
        cmd.includes("app-team1:cicd-token") && 
        (cmd.includes("-n app-team1") || cmd.includes("--namespace=app-team1"))
      );
      
      const wrongSaBinding = history.some(cmd => cmd.includes("default:cicd-token") && cmd.includes("rolebinding"));

      if (!cr) return { success: false, msg: "Bạn chưa tạo ClusterRole 'deployment-clusterrole' với đủ tài nguyên và quyền 'create'." };
      if (!sa) return { success: false, msg: "Bạn chưa tạo ServiceAccount 'cicd-token' trong namespace 'app-team1'." };
      if (wrongSaBinding) return { success: false, msg: "CẢNH BÁO trap! Bạn đang gán ServiceAccount default:cicd-token. Hãy sửa thành app-team1:cicd-token." };
      if (!rb) return { success: false, msg: "Bạn chưa tạo RoleBinding trong namespace 'app-team1' liên kết đúng ServiceAccount." };
      
      return { success: true, msg: "Xuất sắc! Bạn đã vượt qua câu hỏi RBAC và phát hiện ra bẫy namespace của ServiceAccount." };
    }
  },
  {
    id: 6,
    category: "Logging & sidecar",
    title: "Trích xuất log theo mẫu",
    context: "k8s",
    description: "Đọc log của Pod tên `frontend` chạy trong namespace hiện tại, tìm các dòng log có chứa từ khóa `started` (không phân biệt hoa thường) và ghi các dòng log này vào file `/opt/error-logs`.",
    difficulty: "Dễ",
    weight: "3%",
    taskRequirements: [
      "Context yêu cầu: k8s",
      "Truy xuất log của pod frontend.",
      "Lọc từ khóa 'started' (chấp nhận cả 'Started' hoặc 'STARTED').",
      "Ghi đè output vào file /opt/error-logs."
    ],
    sampleAnswers: [
      "kubectl logs frontend | grep -i \"started\" > /opt/error-logs"
    ],
    breakdown: [
      {
        cmd: "kubectl logs frontend | grep -i \"started\" > /opt/error-logs",
        explain: [
          "kubectl logs frontend: Xuất toàn bộ logs của Pod frontend ra màn hình.",
          "| grep -i \"started\": Ký hiệu pipe '|' giúp lọc luồng log qua lệnh grep. Cờ '-i' giúp lọc không phân biệt chữ hoa, chữ thường của từ khóa 'started'.",
          "> /opt/error-logs: Redirect ghi đè các dòng log thỏa mãn vào file kết quả."
        ]
      }
    ],
    validate: (history, files) => {
      const hasCmd = history.some(cmd => 
        cmd.includes("logs frontend") && 
        cmd.includes("grep") && 
        cmd.includes("started") && 
        cmd.includes("/opt/error-logs")
      );
      if (!hasCmd) return { success: false, msg: "Lệnh lọc log chưa chính xác. Bạn cần dùng 'kubectl logs frontend | grep -i started > /opt/error-logs'." };
      return { success: true, msg: "Chính xác! Lệnh đã lọc log và xuất ra file đích đúng cách." };
    }
  },
  {
    id: 7,
    category: "Network Policies",
    title: "Cấu hình NetworkPolicy cho Port & Namespace",
    context: "k8s",
    description: "Tạo một NetworkPolicy tên `allow-port-from-namespace` trong namespace `echo` sao cho các Pod trong namespace `my-app` được phép kết nối tới cổng `9000` của các Pod thuộc namespace `echo`. Mọi kết nối khác phải bị chặn.",
    difficulty: "Khó",
    weight: "7%",
    taskRequirements: [
      "Context yêu cầu: k8s",
      "Bắt buộc viết file network.yaml bằng cách gõ 'vi network.yaml' trong terminal để cấu hình.",
      "Quy tắc ingress cho phép kết nối từ namespace my-app (sử dụng namespaceSelector).",
      "Chỉ cho phép cổng 9000 TCP."
    ],
    sampleAnswers: [
      "vi network.yaml",
      "kubectl apply -f network.yaml"
    ],
    breakdown: [
      {
        cmd: "kubectl apply -f network.yaml",
        explain: [
          "kubectl apply -f network.yaml: Khởi tạo/cập nhật tài nguyên NetworkPolicy cấu hình từ file YAML.",
          "Cấu trúc YAML bắt buộc phải khai báo:",
          "1. namespace: echo (để áp dụng NetworkPolicy vào namespace đích).",
          "2. podSelector: {} (áp dụng cho mọi Pod trong namespace echo).",
          "3. ingress.from.namespaceSelector: khớp nhãn 'kubernetes.io/metadata.name: my-app' (hoặc 'name: my-app') để nhận kết nối từ namespace my-app.",
          "4. ports: protocol TCP và port: 9000 để chỉ mở đúng cổng 9000."
        ]
      }
    ],
    validate: (history, files) => {
      const yaml = files['network.yaml'] || '';
      if (!yaml) return { success: false, msg: "Bạn chưa tạo hoặc chỉnh sửa file 'network.yaml' bằng VIM editor (gõ: vi network.yaml)." };
      if (!yaml.includes("namespace: echo")) return { success: false, msg: "Lỗi YAML: Ingress Policy chưa chỉ định đúng 'namespace: echo'." };
      if (!yaml.includes("port: 9000")) return { success: false, msg: "Lỗi YAML: Chỉ cho phép cổng kết nối 'port: 9000'." };
      if (!yaml.includes("namespaceSelector")) return { success: false, msg: "Lỗi YAML: Thiếu bộ lọc 'namespaceSelector' để đón nhận traffic từ namespace khác." };
      
      const hasApply = history.some(cmd => cmd.includes("apply") && cmd.includes("network.yaml"));
      if (!hasApply) return { success: false, msg: "Bạn chưa chạy lệnh áp dụng 'kubectl apply -f network.yaml'." };
      return { success: true, msg: "Rất tốt! Đảm bảo file YAML của bạn cấu hình đúng namespace: echo, matchLabels của namespaceSelector là 'kubernetes.io/metadata.name: my-app' (hoặc 'name: my-app') và port: 9000." };
    }
  },
  {
    id: 8,
    category: "Node Maintenance",
    title: "Bảo trì Node (Cordon & Drain)",
    context: "k8s",
    description: "Hãy thiết lập Node `ek8s-node-1` ở trạng thái không sẵn sàng lập lịch (Cordon), sau đó trục xuất (Drain) toàn bộ các Pod đang chạy trên Node này sang các Node khác trong hệ thống để chuẩn bị bảo trì.",
    difficulty: "Trung bình",
    weight: "4%",
    taskRequirements: [
      "Context yêu cầu: k8s",
      "Chạy lệnh cordon cho node ek8s-node-1.",
      "Chạy lệnh drain cho node ek8s-node-1 với các tham số loại bỏ DaemonSet, emptyDir data và cưỡng chế."
    ],
    sampleAnswers: [
      "kubectl cordon ek8s-node-1",
      "kubectl drain ek8s-node-1 --delete-emptydir-data --ignore-daemonsets --force"
    ],
    breakdown: [
      {
        cmd: "kubectl cordon ek8s-node-1",
        explain: [
          "kubectl cordon ek8s-node-1: Đánh dấu Node 'ek8s-node-1' ở trạng thái SchedulingDisabled (chặn không cho phép Pod mới được lập lịch chạy lên Node này)."
        ]
      },
      {
        cmd: "kubectl drain ek8s-node-1 --delete-emptydir-data --ignore-daemonsets --force",
        explain: [
          "kubectl drain ek8s-node-1: Thực hiện trục xuất (di tản) các Pod nghiệp vụ đang chạy trên Node.",
          "--delete-emptydir-data: Chấp nhận xóa các Pod có sử dụng ổ đĩa lưu trữ tạm thời emptyDir (làm mất dữ liệu tạm).",
          "--ignore-daemonsets: Bỏ qua và không trục xuất các Pod hệ thống chạy bằng DaemonSet (nếu không có cờ này lệnh drain sẽ bị kẹt báo lỗi).",
          "--force: Cưỡng chế di tản các Pod đơn lẻ không do ReplicaSet/Deployment quản lý."
        ]
      }
    ],
    validate: (history, files) => {
      const hasCordon = history.some(cmd => cmd.includes("cordon ek8s-node-1"));
      const hasDrain = history.some(cmd => cmd.includes("drain ek8s-node-1"));
      const hasIgnoreDS = history.some(cmd => cmd.includes("drain ek8s-node-1") && cmd.includes("ignore-daemonsets"));
      const hasDeleteLocal = history.some(cmd => cmd.includes("drain ek8s-node-1") && (cmd.includes("delete-local-data") || cmd.includes("delete-emptydir-data")));
      
      if (!hasCordon) return { success: false, msg: "Bạn chưa chạy lệnh cô lập Node 'kubectl cordon ek8s-node-1'." };
      if (!hasDrain) return { success: false, msg: "Bạn chưa chạy lệnh trục xuất Node 'kubectl drain ek8s-node-1'." };
      if (!hasIgnoreDS) return { success: false, msg: "Lệnh drain thiếu cờ '--ignore-daemonsets'. Việc thiếu cờ này sẽ khiến tiến trình drain bị thất bại do các pod hệ thống." };
      if (!hasDeleteLocal) return { success: false, msg: "Lệnh drain thiếu cờ '--delete-emptydir-data' (hoặc '--delete-local-data'). Kubelet sẽ chặn drain nếu phát hiện pod có chứa local storage." };
      
      return { success: true, msg: "Hoàn toàn chính xác! Quy trình drain node của bạn đã đủ các tham số an toàn." };
    }
  },
  {
    id: 9,
    category: "Etcd Backup & Restore",
    title: "Backup dữ liệu ETCD Snapshot",
    context: "k8s",
    description: "Hãy sao lưu dữ liệu của ETCD chạy tại endpoint `https://127.0.0.1:2379` ra file snapshot tại đường dẫn `/srv/data/etcd-snapshot.db`. Các file chứng chỉ được cung cấp: CA: `/opt/KUCM00302/ca.crt`, Cert: `/opt/KUCM00302/etcd-client.crt`, Key: `/opt/KUCM00302/etcd-client.key`.",
    difficulty: "Khó",
    weight: "7%",
    taskRequirements: [
      "Context yêu cầu: k8s",
      "Sử dụng tiền tố ETCDCTL_API=3.",
      "Chỉ định đúng endpoints, cacert, cert và key.",
      "Chạy lệnh snapshot save ra đúng đường dẫn yêu cầu."
    ],
    sampleAnswers: [
      "ETCDCTL_API=3 etcdctl --endpoints=https://127.0.0.1:2379 --cacert=/opt/KUCM00302/ca.crt --cert=/opt/KUCM00302/etcd-client.crt --key=/opt/KUCM00302/etcd-client.key snapshot save /srv/data/etcd-snapshot.db"
    ],
    breakdown: [
      {
        cmd: "ETCDCTL_API=3 etcdctl --endpoints=https://127.0.0.1:2379 --cacert=/opt/KUCM00302/ca.crt --cert=/opt/KUCM00302/etcd-client.crt --key=/opt/KUCM00302/etcd-client.key snapshot save /srv/data/etcd-snapshot.db",
        explain: [
          "ETCDCTL_API=3: Thiết lập phiên bản API của công cụ etcdctl chạy ở bản v3 (bắt buộc).",
          "etcdctl --endpoints=...: Địa chỉ IP cổng dịch vụ kết nối tới ETCD cluster.",
          "--cacert=...: File chứng chỉ CA chứng thực độ tin cậy của ETCD server.",
          "--cert=...: Chứng chỉ Client Cert dùng để định danh kết nối TLS.",
          "--key=...: Private Key bảo mật mã hóa đường truyền của Client.",
          "snapshot save /srv/data/etcd-snapshot.db: Chạy lệnh sao lưu và ghi nhận file database snapshot tại đường dẫn đích."
        ]
      }
    ],
    validate: (history, files) => {
      const hasApi = history.some(cmd => cmd.includes("ETCDCTL_API=3"));
      const hasEndpoints = history.some(cmd => cmd.includes("--endpoints=https://127.0.0.1:2379"));
      const hasCerts = history.some(cmd => cmd.includes("cacert") && cmd.includes("cert") && cmd.includes("key"));
      const hasSave = history.some(cmd => cmd.includes("snapshot save") && cmd.includes("/srv/data/etcd-snapshot.db"));
      
      if (!hasApi) return { success: false, msg: "Cần chỉ định biến môi trường 'ETCDCTL_API=3' ở đầu câu lệnh." };
      if (!hasEndpoints) return { success: false, msg: "Thiếu tham số '--endpoints=https://127.0.0.1:2379'." };
      if (!hasCerts) return { success: false, msg: "Thiếu hoặc sai đường dẫn các chứng chỉ bảo mật (cacert, cert, key)." };
      if (!hasSave) return { success: false, msg: "Thiếu lệnh 'snapshot save' hoặc đường dẫn lưu file không khớp với yêu cầu." };
      
      return { success: true, msg: "Rất tốt! Câu lệnh backup ETCD của bạn đã hoàn hảo." };
    }
  },
  {
    id: 10,
    category: "Deployment & Scaling",
    title: "Nâng cấp và Rollback Deployment",
    context: "k8s",
    description: "Cập nhật deployment `nginx-app` lên phiên bản container image `nginx:1.11.13-alpine` và ghi nhận lịch sử (rolling update). Sau đó, thực hiện rollback (hoàn tác) đợt nâng cấp này về trạng thái trước đó.",
    difficulty: "Trung bình",
    weight: "4%",
    taskRequirements: [
      "Context yêu cầu: k8s",
      "Sử dụng set image để nâng cấp image của deployment.",
      "Sử dụng cờ --record để ghi nhận thay đổi.",
      "Sử dụng rollout undo để rollback."
    ],
    sampleAnswers: [
      "kubectl set image deployment/nginx-app nginx=nginx:1.11.13-alpine --record",
      "kubectl rollout undo deployment/nginx-app"
    ],
    breakdown: [
      {
        cmd: "kubectl set image deployment/nginx-app nginx=nginx:1.11.13-alpine --record",
        explain: [
          "kubectl set image: Lệnh thay thế container image trực tiếp cho tài nguyên.",
          "deployment/nginx-app: Chỉ định đối tượng sửa đổi là Deployment tên 'nginx-app'.",
          "nginx=nginx:1.11.13-alpine: Sửa đổi container tên là 'nginx' sử dụng image phiên bản mới.",
          "--record: Lưu lại câu lệnh đã chạy vào lịch sử Change-Cause phục vụ tra cứu sau này."
        ]
      },
      {
        cmd: "kubectl rollout undo deployment/nginx-app",
        explain: [
          "kubectl rollout undo: Lệnh hoàn tác (rollback) đợt thay đổi gần nhất.",
          "deployment/nginx-app: Chỉ định đối tượng cần rollback là Deployment nginx-app."
        ]
      }
    ],
    validate: (history, files) => {
      const hasSet = history.some(cmd => cmd.includes("set image") && cmd.includes("nginx-app") && cmd.includes("nginx:1.11.13-alpine"));
      const hasRecord = history.some(cmd => cmd.includes("set image") && cmd.includes("--record"));
      const hasUndo = history.some(cmd => cmd.includes("rollout undo") && cmd.includes("nginx-app"));
      
      if (!hasSet) return { success: false, msg: "Bạn chưa chạy lệnh cập nhật image cho deployment 'nginx-app'." };
      if (!hasRecord) return { success: false, msg: "Trap! Bạn quên gắn cờ '--record' khi chạy lệnh nâng cấp để lưu lại lịch sử thay đổi." };
      if (!hasUndo) return { success: false, msg: "Bạn chưa thực hiện lệnh rollback 'kubectl rollout undo'." };
      
      return { success: true, msg: "Chính xác! Lịch sử nâng cấp đã được ghi nhận và lệnh rollback đã hoàn tác thành công." };
    }
  },
  {
    id: 11,
    category: "Storage",
    title: "Cấu hình StorageClass Mặc định",
    context: "k8s-master-0",
    description: "Tạo một StorageClass tên là `local-path` sử dụng provisioner `rancher.io/local-path`, volumeBindingMode là `WaitForFirstConsumer`. Đặt StorageClass này làm mặc định cho cụm.",
    difficulty: "Trung bình",
    weight: "4%",
    taskRequirements: [
      "Context yêu cầu: k8s-master-0",
      "Bắt buộc viết file local-path-sc.yaml bằng cách gõ 'vi local-path-sc.yaml' trong terminal để cấu hình.",
      "Thiết lập provisioner rancher.io/local-path.",
      "Thiết lập volumeBindingMode WaitForFirstConsumer.",
      "Đánh dấu annotation mặc định (is-default-class: true)."
    ],
    sampleAnswers: [
      "vi local-path-sc.yaml",
      "kubectl apply -f local-path-sc.yaml"
    ],
    breakdown: [
      {
        cmd: "kubectl apply -f local-path-sc.yaml",
        explain: [
          "kubectl apply -f local-path-sc.yaml: Áp dụng file YAML chứa định nghĩa StorageClass.",
          "Cấu trúc YAML phải chứa các nhãn khóa:",
          "- metadata.annotations.storageclass.kubernetes.io/is-default-class: 'true' (Để đặt làm SC mặc định).",
          "- provisioner: rancher.io/local-path (Trình cấu hình lưu trữ).",
          "- volumeBindingMode: WaitForFirstConsumer (Trì hoãn việc liên kết PV cho đến khi Pod được lập lịch)."
        ]
      }
    ],
    validate: (history, files) => {
      const yaml = files['local-path-sc.yaml'] || '';
      if (!yaml) return { success: false, msg: "Bạn chưa tạo hoặc chỉnh sửa file 'local-path-sc.yaml' bằng VIM editor (gõ: vi local-path-sc.yaml)." };
      if (!yaml.includes("name: local-path")) return { success: false, msg: "Lỗi YAML: Tên StorageClass cấu hình phải là 'local-path'." };
      if (!yaml.includes("is-default-class: \"true\"") && !yaml.includes("is-default-class: 'true'")) return { success: false, msg: "Lỗi YAML: Thiếu annotation đánh dấu StorageClass mặc định." };
      if (!yaml.includes("provisioner: rancher.io/local-path")) return { success: false, msg: "Lỗi YAML: Cấu hình sai provisioner." };
      if (!yaml.includes("volumeBindingMode: WaitForFirstConsumer")) return { success: false, msg: "Lỗi YAML: Thiếu cấu hình volumeBindingMode 'WaitForFirstConsumer'." };
      
      const hasApply = history.some(cmd => cmd.includes("apply") && cmd.includes("local-path-sc.yaml"));
      if (!hasApply) return { success: false, msg: "Bạn chưa chạy lệnh apply để tạo StorageClass." };
      return { success: true, msg: "Tuyệt vời! StorageClass mặc định đã được lập lịch khởi tạo thành công." };
    }
  },
  {
    id: 12,
    category: "Storage",
    title: "Tạo PVC, Pod và Mở rộng Dung lượng",
    context: "k8s-master-0",
    description: "Tạo PVC tên `pv-volume` dung lượng `10Mi`, accessMode `ReadWriteOnce`, storageClass `csi-hostpath-sc`. Gắn PVC này vào Pod nginx tên `web-server` tại mountPath `/usr/share/nginx/html`. Sau đó, mở rộng dung lượng PVC lên `70Mi` và ghi nhận lịch sử thay đổi.",
    difficulty: "Khó",
    weight: "6%",
    taskRequirements: [
      "Context yêu cầu: k8s-master-0",
      "Tạo PVC pv-volume 10Mi với csi-hostpath-sc (sử dụng vi pvc.yaml).",
      "Gắn PVC vào Pod web-server tại /usr/share/nginx/html (sử dụng vi pod-pvc.yaml).",
      "Dùng kubectl edit / patch để mở rộng dung lượng PVC lên 70Mi có cờ --record."
    ],
    sampleAnswers: [
      "vi pvc.yaml",
      "kubectl apply -f pvc.yaml",
      "vi pod-pvc.yaml",
      "kubectl apply -f pod-pvc.yaml",
      "kubectl edit pvc pv-volume --record"
    ],
    breakdown: [
      {
        cmd: "kubectl edit pvc pv-volume --record",
        explain: [
          "kubectl edit pvc pv-volume: Sửa trực tiếp thông số PVC trên API server.",
          "--record: Ghi lại lịch sử chỉnh sửa để phục vụ mục đích audit/rollout sau này.",
          "Trong trình soạn thảo, bạn sửa 'storage: 10Mi' thành 'storage: 70Mi' để bắt đầu resize volume."
        ]
      }
    ],
    validate: (history, files) => {
      const pvcYaml = files['pvc.yaml'] || '';
      const podYaml = files['pod-pvc.yaml'] || '';
      if (!pvcYaml) return { success: false, msg: "Bạn chưa viết file cấu hình PVC 'pvc.yaml' bằng vi." };
      if (!podYaml) return { success: false, msg: "Bạn chưa viết file cấu hình Pod 'pod-pvc.yaml' bằng vi." };
      if (!podYaml.includes("claimName: pv-volume")) return { success: false, msg: "Lỗi YAML Pod: Trường claimName phải trỏ tới đúng PVC 'pv-volume'." };
      
      const hasResize = history.some(cmd => (cmd.includes("edit pvc") || cmd.includes("patch pvc")) && cmd.includes("pv-volume"));
      const hasRecord = history.some(cmd => cmd.includes("edit pvc") && cmd.includes("--record"));
      
      if (!hasResize) return { success: false, msg: "Bạn chưa chạy lệnh edit/patch để mở rộng dung lượng PVC." };
      if (!hasRecord) return { success: false, msg: "Cảnh báo bẫy! Bạn quên ghi nhận lịch sử thay đổi bằng cờ '--record' khi edit." };
      return { success: true, msg: "Chính xác! Bạn đã hoàn thành bài toán mở rộng dung lượng lưu trữ bền vững." };
    }
  },
  {
    id: 13,
    category: "Static Pods & DaemonSets",
    title: "Tạo Static Pod trên Worker Node",
    context: "k8s-master-0",
    description: "Cấu hình Kubelet trên Node `wk8s-node-1` để chạy tự động một Pod tên `webtool` dùng image `httpd` dưới dạng Static Pod.",
    difficulty: "Trung bình",
    weight: "4%",
    taskRequirements: [
      "Context yêu cầu: k8s-master-0",
      "SSH vào Node wk8s-node-1.",
      "Tìm thư mục staticPodPath của Kubelet (/etc/kubernetes/manifests).",
      "Tạo file manifest webtool.yaml bằng vi tại thư mục này."
    ],
    sampleAnswers: [
      "ssh wk8s-node-1",
      "vi webtool.yaml"
    ],
    breakdown: [
      {
        cmd: "ssh wk8s-node-1",
        explain: [
          "ssh wk8s-node-1: Kết nối an sau Worker Node wk8s-node-1 để thao tác trực tiếp trên máy chủ."
        ]
      },
      {
        cmd: "cd /etc/kubernetes/manifests",
        explain: [
          "cd /etc/kubernetes/manifests: Di chuyển vào thư mục Kubelet Static Pod manifest. Kubelet sẽ liên tục quét thư mục này và tự động khởi chạy/xóa các Pod dựa trên các file YAML ở đây."
        ]
      }
    ],
    validate: (history, files) => {
      const hasSsh = history.some(cmd => cmd.includes("ssh wk8s-node-1"));
      const yaml = files['webtool.yaml'] || '';
      if (!hasSsh) return { success: false, msg: "Bạn chưa SSH vào đúng Node 'wk8s-node-1'." };
      if (!yaml) return { success: false, msg: "Bạn chưa mở và soạn thảo file manifests cấu hình 'webtool.yaml' bằng vi." };
      if (!yaml.includes("name: webtool")) return { success: false, msg: "Lỗi YAML: Tên Pod phải đặt là 'webtool'." };
      if (!yaml.includes("image: httpd")) return { success: false, msg: "Lỗi YAML: Container phải chạy image 'httpd'." };
      return { success: true, msg: "Rất tốt! Static Pod đã được tạo trên Worker Node." };
    }
  },
  {
    id: 14,
    category: "Static Pods & DaemonSets",
    title: "Tạo DaemonSet chạy trên mọi Node",
    context: "k8s-master-0",
    description: "Tạo một DaemonSet tên `ds-kusc00201` chạy container image `nginx` trên tất cả các Node trong cụm. Lưu ý: không được override các taints cản trở sẵn có.",
    difficulty: "Khó",
    weight: "4%",
    taskRequirements: [
      "Context yêu cầu: k8s-master-0",
      "Bắt buộc viết cấu hình DaemonSet ra file bằng lệnh 'vi daemonset.yaml'.",
      "Khai báo tolerations để Pod có thể chạy được trên cả Master Node bị taint NoSchedule."
    ],
    sampleAnswers: [
      "vi daemonset.yaml",
      "kubectl apply -f daemonset.yaml"
    ],
    breakdown: [
      {
        cmd: "kubectl apply -f daemonset.yaml",
        explain: [
          "kubectl apply -f daemonset.yaml: Khởi tạo tài nguyên DaemonSet.",
          "Trong file YAML, bạn bắt buộc phải có mục:",
          "- tolerations: Chấp nhận các taints 'node-role.kubernetes.io/master:NoSchedule' để chạy trên Master Node."
        ]
      }
    ],
    validate: (history, files) => {
      const yaml = files['daemonset.yaml'] || '';
      if (!yaml) return { success: false, msg: "Bạn chưa viết file cấu hình DaemonSet 'daemonset.yaml' bằng vi." };
      if (!yaml.includes("kind: DaemonSet")) return { success: false, msg: "Lỗi YAML: Tài nguyên khai báo phải thuộc kind 'DaemonSet'." };
      if (!yaml.includes("tolerations")) return { success: false, msg: "Cảnh báo bẫy! Thiếu phần cấu hình tolerations để Pod có thể lập lịch được trên các Node master bị taints." };
      
      const hasApply = history.some(cmd => cmd.includes("apply") && cmd.includes("daemonset.yaml"));
      if (!hasApply) return { success: false, msg: "Bạn chưa chạy lệnh apply để tạo DaemonSet." };
      return { success: true, msg: "Hoàn hảo! DaemonSet sẽ tự động tạo bản sao Pod trên mọi Node." };
    }
  },
  {
    id: 15,
    category: "Deployment & Scaling",
    title: "Cấu hình HPA Co giãn Tự động với Stabilization Window",
    context: "k8s-master-0",
    description: "Tạo HorizontalPodAutoscaler tên `apache-server` trong namespace `autoscale` cho Deployment `apache-server`. Target 50% CPU, min 1 Pod, max 4 Pods. Cấu hình stabilization window khi scale down là 30 giây.",
    difficulty: "Khó",
    weight: "7%",
    taskRequirements: [
      "Context yêu cầu: k8s-master-0",
      "Chạy lệnh dry-run xuất YAML: k autoscale deployment apache-server --cpu-percent=50 --min=1 --max=4 -n autoscale --dry-run=client -o yaml > hpa.yaml",
      "Mở sửa 'vi hpa.yaml' để thêm cấu hình behavior.scaleDown.stabilizationWindowSeconds = 30.",
      "Chạy apply để tạo HPA."
    ],
    sampleAnswers: [
      "kubectl autoscale deployment apache-server --cpu-percent=50 --min=1 --max=4 -n autoscale --dry-run=client -o yaml > hpa.yaml",
      "vi hpa.yaml",
      "kubectl apply -f hpa.yaml"
    ],
    breakdown: [
      {
        cmd: "kubectl autoscale deployment apache-server --cpu-percent=50 --min=1 --max=4 -n autoscale --dry-run=client -o yaml > hpa.yaml",
        explain: [
          "kubectl autoscale...: Lệnh nhanh để sinh khung YAML cấu hình HPA.",
          "--dry-run=client -o yaml: Chỉ xuất nội dung YAML ra màn hình chứ không tạo tài nguyên thực tế.",
          "> hpa.yaml: Ghi nội dung vào file để chuẩn bị cấu hình các tham số nâng cao."
        ]
      },
      {
        cmd: "kubectl apply -f hpa.yaml",
        explain: [
          "kubectl apply -f hpa.yaml: Khởi chạy HPA sau khi đã thêm mục 'behavior.scaleDown.stabilizationWindowSeconds: 30' vào cấu trúc file."
        ]
      }
    ],
    validate: (history, files) => {
      const yaml = files['hpa.yaml'] || '';
      if (!yaml) return { success: false, msg: "Bạn chưa chỉnh sửa file 'hpa.yaml' bằng vi." };
      if (!yaml.includes("stabilizationWindowSeconds")) return { success: false, msg: "Lỗi HPA: Chưa khai báo tham số trễ downscale (stabilizationWindowSeconds)." };
      if (!yaml.includes("30")) return { success: false, msg: "Lỗi HPA: Thời gian trễ scale down cấu hình sai (đề yêu cầu 30 giây)." };
      
      const hasApply = history.some(cmd => cmd.includes("apply -f hpa.yaml"));
      if (!hasApply) return { success: false, msg: "Bạn chưa chạy lệnh apply để tạo HPA." };
      return { success: true, msg: "Tuyệt vời! Stabilization window đã được gán chính xác." };
    }
  },
  {
    id: 16,
    category: "Ingress & Services",
    title: "Tạo Ingress định tuyến đường dẫn cơ bản",
    context: "k8s-master-0",
    description: "Tạo một Ingress resource tên `ping` trong namespace `ing-internal` định tuyến traffic đường dẫn `/hi` tới service `hi` cổng `5678`.",
    difficulty: "Trung bình",
    weight: "4%",
    taskRequirements: [
      "Context yêu cầu: k8s-master-0",
      "Bắt buộc viết file ingress.yaml bằng cách gõ 'vi ingress.yaml' trong terminal để cấu hình.",
      "Quy tắc path: /hi, pathType: Prefix.",
      "Backend trỏ tới service hi, port number 5678."
    ],
    sampleAnswers: [
      "vi ingress.yaml",
      "kubectl apply -f ingress.yaml"
    ],
    breakdown: [
      {
        cmd: "kubectl apply -f ingress.yaml",
        explain: [
          "kubectl apply -f ingress.yaml: Khởi tạo định tuyến HTTP Ingress.",
          "File YAML khai báo các trường:",
          "- namespace: ing-internal",
          "- path: /hi, pathType: Prefix",
          "- backend.service: name là 'hi' và port.number là '5678'."
        ]
      }
    ],
    validate: (history, files) => {
      const yaml = files['ingress.yaml'] || '';
      if (!yaml) return { success: false, msg: "Bạn chưa viết file cấu hình Ingress 'ingress.yaml' bằng vi." };
      if (!yaml.includes("namespace: ing-internal")) return { success: false, msg: "Lỗi Ingress: Phải triển khai trong namespace 'ing-internal'." };
      if (!yaml.includes("path: /hi")) return { success: false, msg: "Lỗi Ingress: Cấu hình sai đường dẫn (đề yêu cầu '/hi')." };
      if (!yaml.includes("port:") || !yaml.includes("5678")) return { success: false, msg: "Lỗi Ingress: Cấu hình sai cổng service port (đề yêu cầu '5678')." };
      
      const hasApply = history.some(cmd => cmd.includes("apply") && cmd.includes("ingress.yaml"));
      if (!hasApply) return { success: false, msg: "Bạn chưa chạy lệnh apply để tạo Ingress." };
      return { success: true, msg: "Rất tốt! Ingress định tuyến đã được thiết lập." };
    }
  },
  {
    id: 17,
    category: "Ingress & Services",
    title: "Cấu hình Ingress Host và Rewrite Target",
    context: "k8s-master-0",
    description: "Tạo một Ingress resource tên `echo` trong namespace `sound-repeater` định tuyến host `example.org` đường dẫn `/echo` tới service `echoserver-service` cổng `8080`. Sử dụng rewrite-target.",
    difficulty: "Khó",
    weight: "7%",
    taskRequirements: [
      "Context yêu cầu: k8s-master-0",
      "Viết file echo-ingress.yaml bằng cách gõ 'vi echo-ingress.yaml' trong terminal để cấu hình.",
      "Khai báo host: example.org.",
      "Thêm annotation rewrite-target: /$1.",
      "Trỏ tới service echoserver-service cổng 8080."
    ],
    sampleAnswers: [
      "vi echo-ingress.yaml",
      "kubectl apply -f echo-ingress.yaml"
    ],
    breakdown: [
      {
        cmd: "kubectl apply -f echo-ingress.yaml",
        explain: [
          "kubectl apply -f echo-ingress.yaml: Khởi chạy cấu hình Ingress phức tạp.",
          "Các thông số chính trong YAML:",
          "- annotation 'nginx.ingress.kubernetes.io/rewrite-target: /$1' (Giúp làm sạch đường dẫn khi forward traffic).",
          "- host: example.org (Giới hạn tên miền đón traffic).",
          "- backend service: echoserver-service cổng 8080."
        ]
      }
    ],
    validate: (history, files) => {
      const yaml = files['echo-ingress.yaml'] || '';
      if (!yaml) return { success: false, msg: "Bạn chưa soạn thảo file 'echo-ingress.yaml' bằng vi." };
      if (!yaml.includes("host: example.org")) return { success: false, msg: "Lỗi Ingress: Thiếu hoặc sai cấu hình host (phải là 'example.org')." };
      if (!yaml.includes("rewrite-target: /$1")) return { success: false, msg: "Lỗi Ingress: Thiếu annotation 'rewrite-target: /$1'." };
      if (!yaml.includes("namespace: sound-repeater")) return { success: false, msg: "Lỗi Ingress: Chưa gắn namespace 'sound-repeater'." };
      
      const hasApply = history.some(cmd => cmd.includes("apply") && cmd.includes("echo-ingress.yaml"));
      if (!hasApply) return { success: false, msg: "Hãy chạy lệnh apply để kích hoạt cấu hình Ingress." };
      return { success: true, msg: "Chính xác! Cấu hình Ingress Rewrite Host đã hoàn tất." };
    }
  },
  {
    id: 18,
    category: "Pod & Namespace",
    title: "Tạo Pod Multi-container (Nhiều Container)",
    context: "k8s-master-0",
    description: "Tạo một Pod tên `kucc8` chứa 3 containers chạy song song sử dụng các image sau: `nginx`, `redis`, `memcached`.",
    difficulty: "Trung bình",
    weight: "4%",
    taskRequirements: [
      "Context yêu cầu: k8s-master-0",
      "Tạo file pod.yaml bằng dry-run: k run kucc8 --image=nginx --dry-run=client -o yaml > pod.yaml",
      "Soạn thảo 'vi pod.yaml' để cấu hình thêm 2 container còn lại.",
      "Chạy apply để tạo Pod."
    ],
    sampleAnswers: [
      "kubectl run kucc8 --image=nginx --dry-run=client -o yaml > pod.yaml",
      "vi pod.yaml",
      "kubectl apply -f pod.yaml"
    ],
    breakdown: [
      {
        cmd: "kubectl run kucc8 --image=nginx --dry-run=client -o yaml > pod.yaml",
        explain: [
          "kubectl run kucc8 --image=nginx: Tạo khung mẫu Pod chạy container đầu tiên sử dụng image nginx.",
          "--dry-run=client -o yaml > pod.yaml: Xuất file YAML mẫu để chỉnh sửa."
        ]
      },
      {
        cmd: "kubectl apply -f pod.yaml",
        explain: [
          "kubectl apply -f pod.yaml: Khởi chạy Pod sau khi bạn đã tự sao chép và định nghĩa thêm 2 khối container (redis và memcached) vào mục 'spec.containers'."
        ]
      }
    ],
    validate: (history, files) => {
      const yaml = files['pod.yaml'] || '';
      if (!yaml) return { success: false, msg: "Bạn chưa xuất file YAML hoặc chưa soạn thảo 'pod.yaml' bằng vi." };
      
      const matches = (yaml.match(/image:/g) || []).length;
      if (matches < 3) return { success: false, msg: "Lỗi YAML: Số lượng container khai báo phải là 3 (hiện tại chỉ phát hiện " + matches + " container)." };
      if (!yaml.includes("name: kucc8")) return { success: false, msg: "Lỗi YAML: Tên Pod cấu hình phải là 'kucc8'." };
      if (!yaml.includes("image: redis") || !yaml.includes("image: memcached")) return { success: false, msg: "Lỗi YAML: Thiếu cấu hình image container của 'redis' hoặc 'memcached'." };
      
      const hasApply = history.some(cmd => cmd.includes("apply") && cmd.includes("pod.yaml"));
      if (!hasApply) return { success: false, msg: "Bạn chưa chạy lệnh apply để tạo Pod nhiều container." };
      return { success: true, msg: "Chính xác! Pod kucc8 đã được tạo thành công với nhiều container chạy song hành." };
    }
  },
  {
    id: 19,
    category: "Ingress & Services",
    title: "Kiểm tra DNS kết nối cụm bằng nslookup",
    context: "k8s-master-0",
    description: "Chạy một Pod phụ sử dụng nslookup để truy vấn bản ghi DNS của Service `nginx-random` và lưu kết quả vào file `/opt/KUNW00601/service.dns`.",
    difficulty: "Khó",
    weight: "7%",
    taskRequirements: [
      "Context yêu cầu: k8s-master-0",
      "Khởi chạy một Pod phụ có công cụ nslookup (ví dụ image busybox:1.28).",
      "Chạy lệnh nslookup nginx-random trong Pod đó.",
      "Lưu kết quả trực tiếp ra file /opt/KUNW00601/service.dns."
    ],
    sampleAnswers: [
      "kubectl run busybox-dns --image=busybox:1.28 --restart=Never -- sleep 3600",
      "kubectl exec busybox-dns -- nslookup nginx-random > /opt/KUNW00601/service.dns"
    ],
    breakdown: [
      {
        cmd: "kubectl run busybox-dns --image=busybox:1.28 --restart=Never -- sleep 3600",
        explain: [
          "kubectl run busybox-dns: Tạo Pod chạy ngầm tên 'busybox-dns'.",
          "--image=busybox:1.28: Sử dụng image busybox bản 1.28 chứa phiên bản nslookup hoạt động ổn định.",
          "--restart=Never: Đảm bảo tài nguyên tạo ra là Pod đơn.",
          "-- sleep 3600: Lệnh giữ cho container tiếp tục chạy ngầm để ta có thể exec truy cập."
        ]
      },
      {
        cmd: "kubectl exec busybox-dns -- nslookup nginx-random > /opt/KUNW00601/service.dns",
        explain: [
          "kubectl exec busybox-dns: Thực thi lệnh bên trong Pod busybox-dns.",
          "-- nslookup nginx-random: Lệnh truy vấn DNS phân giải tên của Service 'nginx-random'.",
          "> /opt/KUNW00601/service.dns: Redirect ghi luồng output kết quả của DNS vào file đích."
        ]
      }
    ],
    validate: (history, files) => {
      const hasRun = history.some(cmd => cmd.includes("run busybox") && cmd.includes("busybox:1.28"));
      const hasExec = history.some(cmd => cmd.includes("exec") && cmd.includes("nslookup") && cmd.includes("/opt/KUNW00601/service.dns"));
      if (!hasRun) return { success: false, msg: "Bạn chưa chạy Pod phụ busybox:1.28 để làm môi trường truy vấn DNS." };
      if (!hasExec) return { success: false, msg: "Bạn chưa thực hiện lệnh exec chạy nslookup để xuất DNS ra file đích." };
      return { success: true, msg: "Xuất sắc! Tiến trình phân giải DNS đã được ghi lại." };
    }
  },
  {
    id: 20,
    category: "Deployment & Scaling",
    title: "Xuất file cài đặt bằng Helm Template",
    context: "k8s-master-0",
    description: "Thêm Helm repository của Argo CD tên là `argo`. Trích xuất manifest cài đặt từ Helm chart phiên bản `7.7.3` cho namespace `argocd`, lưu tại `~/argo-helm.yaml`. Cấu hình tắt việc cài đặt CRD.",
    difficulty: "Khó",
    weight: "6%",
    taskRequirements: [
      "Context yêu cầu: k8s-master-0",
      "Thêm repo argo: https://argoproj.github.io/argo-helm.",
      "Dùng lệnh helm template trích xuất cấu hình.",
      "Chỉ định phiên bản 7.7.3 và namespace argocd.",
      "Tắt cài đặt CRD (--set crds.install=false).",
      "Lưu kết quả vào ~/argo-helm.yaml."
    ],
    sampleAnswers: [
      "helm repo add argo https://argoproj.github.io/argo-helm",
      "helm repo update",
      "helm template argocd argo/argo-cd --version 7.7.3 --namespace argocd --set crds.install=false > ~/argo-helm.yaml"
    ],
    breakdown: [
      {
        cmd: "helm repo add argo https://argoproj.github.io/argo-helm",
        explain: [
          "helm repo add argo: Thêm nguồn lưu trữ Helm charts của Argo CD đặt tên đại diện là 'argo'."
        ]
      },
      {
        cmd: "helm template argocd argo/argo-cd --version 7.7.3 --namespace argocd --set crds.install=false > ~/argo-helm.yaml",
        explain: [
          "helm template: Kết xuất (render) toàn bộ template YAML từ Chart mà không cài đặt trực tiếp lên cluster.",
          "argocd: Đặt tên Release là 'argocd'.",
          "argo/argo-cd: Tên chart sử dụng nguồn argo.",
          "--version 7.7.3: Chỉ định đúng phiên bản yêu cầu.",
          "--namespace argocd: Gán namespace đích.",
          "--set crds.install=false: Cấu hình biến không tự cài đặt CRDs kèm theo.",
          "> ~/argo-helm.yaml: Ghi luồng YAML kết xuất vào file chỉ định."
        ]
      }
    ],
    validate: (history, files) => {
      const hasRepo = history.some(cmd => cmd.includes("repo add argo"));
      const hasTemplate = history.some(cmd => 
        cmd.includes("helm template") && 
        cmd.includes("argo/argo-cd") && 
        cmd.includes("version 7.7.3") && 
        cmd.includes("crds.install=false") && 
        cmd.includes("~/argo-helm.yaml")
      );
      if (!hasRepo) return { success: false, msg: "Bạn chưa chạy lệnh thêm helm repository." };
      if (!hasTemplate) return { success: false, msg: "Lệnh 'helm template' của bạn chưa đủ các cờ cấu hình và đường dẫn file lưu." };
      return { success: true, msg: "Chính xác! Lệnh Helm template đã xuất cấu hình chính xác." };
    }
  },
  {
    id: 21,
    category: "Troubleshooting",
    title: "Sửa lỗi Node NotReady (Kubelet)",
    context: "k8s-master-0",
    description: "Worker Node `wk8s-node-0` đang ở trạng thái NotReady. Hãy SSH vào Node đó và sửa lỗi để chuyển Node sang trạng thái Ready lâu dài.",
    difficulty: "Trung bình",
    weight: "4%",
    taskRequirements: [
      "Context yêu cầu: k8s-master-0",
      "SSH vào Node wk8s-node-0.",
      "Kiểm tra trạng thái tiến trình kubelet (systemctl status kubelet).",
      "Kích hoạt và khởi động lại dịch vụ kubelet (start, enable)."
    ],
    sampleAnswers: [
      "ssh wk8s-node-0",
      "sudo systemctl start kubelet",
      "sudo systemctl enable kubelet"
    ],
    breakdown: [
      {
        cmd: "sudo systemctl start kubelet",
        explain: [
          "systemctl start kubelet: Lệnh khởi chạy tiến trình dịch vụ Kubelet trên hệ thống Linux."
        ]
      },
      {
        cmd: "sudo systemctl enable kubelet",
        explain: [
          "systemctl enable kubelet: Thiết lập cho dịch vụ Kubelet tự động khởi động cùng hệ điều hành ở các lần reboot sau (đảm bảo tính vĩnh viễn đề bài yêu cầu)."
        ]
      }
    ],
    validate: (history, files) => {
      const hasSsh = history.some(cmd => cmd.includes("ssh wk8s-node-0"));
      const hasStart = history.some(cmd => cmd.includes("start kubelet"));
      const hasEnable = history.some(cmd => cmd.includes("enable kubelet"));
      
      if (!hasSsh) return { success: false, msg: "Bạn chưa kết nối SSH sang Node 'wk8s-node-0'." };
      if (!hasStart) return { success: false, msg: "Bạn chưa chạy lệnh khởi động tiến trình Kubelet." };
      if (!hasEnable) return { success: false, msg: "Cảnh bẫy! Bạn quên bật chế độ tự động chạy dịch vụ cùng hệ thống (enable) để thay đổi có hiệu lực lâu dài." };
      return { success: true, msg: "Rất tốt! Node của bạn sẽ phục hồi trạng thái Ready sau vài giây." };
    }
  },
  {
    id: 22,
    category: "Troubleshooting",
    title: "Cài đặt CRI-dockerd & Tham số Kernel",
    context: "k8s-master-0",
    description: "Cài đặt gói runtime `cri-dockerd` từ file Debian `~/cri-dockerd_0.3.9.3-0.ubuntu-jammy_amd64.deb` bằng dpkg, khởi động dịch vụ và cấu hình vĩnh viễn tham số kernel net.bridge.bridge-nf-call-iptables thành 1.",
    difficulty: "Khó",
    weight: "7%",
    taskRequirements: [
      "Context yêu cầu: k8s-master-0",
      "Cài đặt gói deb bằng lệnh dpkg -i.",
      "Kích hoạt cri-docker dịch vụ.",
      "Sử dụng sysctl để thay đổi net.bridge.bridge-nf-call-iptables = 1."
    ],
    sampleAnswers: [
      "sudo dpkg -i ~/cri-dockerd_0.3.9.3-0.ubuntu-jammy_amd64.deb",
      "sudo systemctl enable --now cri-docker.socket cri-docker",
      "sudo sysctl -w net.bridge.bridge-nf-call-iptables=1"
    ],
    breakdown: [
      {
        cmd: "sudo dpkg -i ~/cri-dockerd_0.3.9.3-0.ubuntu-jammy_amd64.deb",
        explain: [
          "dpkg -i: Lệnh cài đặt trực tiếp gói phần mềm local định dạng .deb trên hệ điều hành Debian/Ubuntu."
        ]
      },
      {
        cmd: "sudo systemctl enable --now cri-docker.socket cri-docker",
        explain: [
          "systemctl enable --now: Kích hoạt dịch vụ khởi động cùng hệ thống đồng thời chạy dịch vụ ngay lập tức mà không cần reboot."
        ]
      },
      {
        cmd: "sudo sysctl -w net.bridge.bridge-nf-call-iptables=1",
        explain: [
          "sysctl -w: Cập nhật động giá trị tham số cấu hình nhân Kernel Linux.",
          "net.bridge.bridge-nf-call-iptables=1: Cho phép chuyển hướng gói tin đi qua network bridge của Linux sang tường lửa iptables xử lý."
        ]
      }
    ],
    validate: (history, files) => {
      const hasDpkg = history.some(cmd => cmd.includes("dpkg -i") && cmd.includes("cri-dockerd"));
      const hasStart = history.some(cmd => cmd.includes("cri-docker") && (cmd.includes("start") || cmd.includes("enable")));
      const hasSysctl = history.some(cmd => cmd.includes("sysctl") && cmd.includes("net.bridge.bridge-nf-call-iptables=1"));
      
      if (!hasDpkg) return { success: false, msg: "Bạn chưa cài đặt gói cri-dockerd thông qua lệnh dpkg." };
      if (!hasStart) return { success: false, msg: "Bạn chưa khởi động dịch vụ hệ thống của cri-docker." };
      if (!hasSysctl) return { success: false, msg: "Bạn chưa cấu hình tham số mạng kernel net.bridge.bridge-nf-call-iptables=1." };
      return { success: true, msg: "Tuyệt vời! Cấu hình CRI và Kernel mạng hoàn tất." };
    }
  },
  {
    id: 23,
    category: "Storage",
    title: "Khôi phục MariaDB Deployment",
    context: "k8s-master-0",
    description: "Tạo một PVC tên là `mariadb` trong namespace `mariadb` có accessMode `ReadWriteOnce` và dung lượng `250Mi` để liên kết với một PV Retained sẵn có. Sau đó cập nhật Deployment tại `~/mariadb-deployment.yaml` sử dụng PVC này và khởi chạy.",
    difficulty: "Khó",
    weight: "7%",
    taskRequirements: [
      "Context yêu cầu: k8s-master-0",
      "Viết cấu hình PVC 'pvc-mariadb.yaml' bằng vi.",
      "Sửa đổi file ~/mariadb-deployment.yaml để mount PVC vừa tạo.",
      "Chạy lệnh apply để khôi phục ứng dụng."
    ],
    sampleAnswers: [
      "vi pvc-mariadb.yaml",
      "kubectl apply -f pvc-mariadb.yaml",
      "kubectl apply -f ~/mariadb-deployment.yaml"
    ],
    breakdown: [
      {
        cmd: "kubectl apply -f ~/mariadb-deployment.yaml",
        explain: [
          "kubectl apply -f ...: Cập nhật cấu hình và triển khai lại Pods của MariaDB Deployment.",
          "Trong file YAML, bạn trỏ thuộc tính 'spec.template.spec.volumes[].persistentVolumeClaim.claimName' tới tên PVC 'mariadb' vừa tạo."
        ]
      }
    ],
    validate: (history, files) => {
      const pvcYaml = files['pvc-mariadb.yaml'] || '';
      if (!pvcYaml) return { success: false, msg: "Bạn chưa tạo hoặc soạn thảo file 'pvc-mariadb.yaml' bằng vi." };
      if (!pvcYaml.includes("storage: 250Mi")) return { success: false, msg: "Lỗi YAML PVC: Dung lượng yêu cầu phải là '250Mi'." };
      if (!pvcYaml.includes("namespace: mariadb")) return { success: false, msg: "Lỗi YAML PVC: Phải chỉ định đúng namespace 'mariadb'." };
      
      const hasApply = history.some(cmd => cmd.includes("apply") && cmd.includes("mariadb-deployment.yaml"));
      if (!hasApply) return { success: false, msg: "Bạn chưa chạy lệnh apply để phục hồi ứng dụng MariaDB sau khi liên kết PVC." };
      return { success: true, msg: "Chính xác! Deployment đã được cập nhật và liên kết đúng PV thông qua PVC mới." };
    }
  }
];

const questionMapping = {
  1: { arch: 0, title: "Đếm số lượng Node Ready Schedulable" },
  2: { arch: 1, title: "Tạo Namespace & Chạy Pod" },
  3: { arch: 20, title: "Sửa lỗi Node NotReady (Kubelet)" },
  4: { arch: 3, title: "Lọc Địa chỉ IP của Pod bằng JsonPath" },
  5: { arch: 11, title: "Tạo PVC, Pod và Mở rộng Dung lượng" },
  6: { arch: 5, title: "Trích xuất log theo mẫu" },
  7: { arch: 2, title: "Định dạng danh sách Pod (Custom Columns)" },
  8: { arch: 3, title: "Lọc thông tin Pod bằng JsonPath" },
  9: { arch: 15, title: "Tạo Ingress định tuyến cơ bản" },
  10: { arch: 17, title: "Tạo Pod Multi-container (Nhiều Container)" },
  11: { arch: 1, title: "Tạo Namespace & Chạy Pod nginx" },
  12: { arch: 2, title: "Định dạng danh sách Pod (Custom Columns)" },
  13: { arch: 5, title: "Trích xuất log theo mẫu (Sidecar)" },
  14: { arch: 5, title: "Xem log Pod và chuyển tiếp log" },
  15: { arch: 9, title: "Nâng cấp và Rollback Deployment" },
  16: { arch: 17, title: "Khởi tạo Pod chứa nhiều Container" },
  17: { arch: 4, title: "Tạo ClusterRole & Gắn quyền giới hạn Namespace" },
  18: { arch: 15, title: "Cấu hình Ingress Service" },
  19: { arch: 18, title: "Kiểm tra DNS kết nối cụm bằng nslookup" },
  20: { arch: 6, title: "Cấu hình NetworkPolicy cho Port & Namespace" },
  21: { arch: 3, title: "Truy vấn IP Pod bằng Jsonpath" },
  22: { arch: 10, title: "Cấu hình StorageClass Mặc định" },
  23: { arch: 1, title: "Tạo Namespace & Chạy Pod" },
  24: { arch: 9, title: "Nâng cấp Deployment Image" },
  25: { arch: 2, title: "Trích xuất danh sách Pod" },
  26: { arch: 9, title: "Scale Deployment và Rollback" },
  27: { arch: 5, title: "Trích xuất log từ Sidecar" },
  28: { arch: 13, title: "Thiết lập tolerations trên Pod" },
  29: { arch: 14, title: "Cấu hình HPA Co giãn Tự động" },
  30: { arch: 2, title: "Custom Columns hiển thị Pod" },
  31: { arch: 1, title: "Tạo Namespace phát triển" },
  32: { arch: 20, title: "Khắc phục sự cố Kubelet sập" },
  33: { arch: 3, title: "JsonPath lấy thông tin Pod" },
  34: { arch: 13, title: "Chạy Pod với NodeSelector" },
  35: { arch: 17, title: "Cấu hình Multi-container Pod" },
  36: { arch: 17, title: "Khởi tạo Pod Init Container" },
  37: { arch: 5, title: "Ghi log từ container phụ" },
  38: { arch: 14, title: "Cấu hình HPA với downscale delay" },
  39: { arch: 15, title: "Tạo Ingress Route" },
  40: { arch: 15, title: "Cấu hình Ingress Path routing" },
  41: { arch: 19, title: "Xuất file cài đặt bằng Helm Template" },
  42: { arch: 1, title: "Chạy Pod Nginx trong namespace mới" },
  43: { arch: 1, title: "Khởi tạo Namespace phát triển" },
  44: { arch: 11, title: "Tạo PVC kết nối Volume" },
  45: { arch: 11, title: "Mở rộng dung lượng PVC" },
  46: { arch: 16, title: "Cấu hình Ingress Host và Rewrite Target" },
  47: { arch: 21, title: "Cài đặt CRI-dockerd & Tham số Kernel" },
  48: { arch: 17, title: "Tạo Pod 3 container" },
  49: { arch: 9, title: "Nâng cấp và Rollback Deployment" },
  50: { arch: 4, title: "RBAC ServiceAccount và RoleBinding" },
  51: { arch: 15, title: "Định tuyến Ingress HTTP" },
  52: { arch: 8, title: "Backup dữ liệu ETCD Snapshot" },
  53: { arch: 7, title: "Bảo trì Node (Cordon & Drain)" },
  54: { arch: 14, title: "Thiết lập HPA Scaling" },
  55: { arch: 20, title: "Sửa lỗi Node NotReady (Kubelet)" },
  56: { arch: 21, title: "Cấu hình CRI runtime" },
  57: { arch: 22, title: "Khôi phục MariaDB Deployment" },
  58: { arch: 19, title: "Helm Render Template" },
  59: { arch: 4, title: "RBAC ClusterRole" },
  60: { arch: 2, title: "Custom Columns Pods" },
  61: { arch: 3, title: "Lọc IP Pod" },
  62: { arch: 5, title: "Trích xuất log" },
  63: { arch: 5, title: "Ghi log ra file" },
  64: { arch: 12, title: "Tạo Static Pod trên Worker Node" },
  65: { arch: 13, title: "Tạo DaemonSet chạy trên mọi Node" },
  66: { arch: 6, title: "Cấu hình NetworkPolicy" },
  67: { arch: 2, title: "Truy vấn danh sách Pod" },
  68: { arch: 13, title: "Pod scheduling selector" },
  69: { arch: 0, title: "Đếm số lượng Node Ready Schedulable" },
  70: { arch: 6, title: "NetworkPolicy chặn traffic" },
  71: { arch: 17, title: "Tạo Pod Multi-container" },
  72: { arch: 20, title: "Sửa lỗi Node Kubelet" },
  73: { arch: 1, title: "Tạo Pod trong Namespace" },
  74: { arch: 3, title: "Lấy IP bằng JsonPath" },
  75: { arch: 8, title: "Sao lưu ETCD" },
  76: { arch: 19, title: "Helm template render" },
  77: { arch: 15, title: "Cấu hình Ingress" },
  78: { arch: 7, title: "Cordon & Drain Node" },
  79: { arch: 2, title: "Danh sách Pod custom columns" },
  80: { arch: 17, title: "Pod Multi-container" },
  81: { arch: 11, title: "PVC Volume Expansion" },
  82: { arch: 22, title: "Restore MariaDB Deployment" },
  83: { arch: 17, title: "Tạo Pod 3 container" }
};

// Programmatically build the 83-question bank
const ckaQuestions = Object.keys(questionMapping).map(id => {
  const mapInfo = questionMapping[id];
  const arch = archetypes[mapInfo.arch];
  return {
    id: parseInt(id),
    category: arch.category,
    title: `Câu ${id}: ${mapInfo.title}`,
    context: arch.context,
    description: arch.description,
    difficulty: arch.difficulty,
    weight: arch.weight,
    taskRequirements: arch.taskRequirements.map(req => {
      // Clean context switched descriptions in subtasks
      if (req.includes("Context yêu cầu")) {
        return `Context yêu cầu: ${arch.context} (Bắt buộc chạy kubectl config use-context ${arch.context})`;
      }
      return req;
    }),
    sampleAnswers: arch.sampleAnswers,
    breakdown: arch.breakdown,
    validate: arch.validate
  };
});
