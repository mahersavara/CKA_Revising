# Certified Kubernetes Administrator (CKA) – Practical Exam Strategy & Question Playbook

> **Candidate:** Khuat Dinh Linh  
> **Environment:** PSI Secure Browser + XFCE Remote Desktop (Ubuntu-based)  
> **Target Certification:** Certified Kubernetes Administrator (CKA) – CNCF / Linux Foundation  
> **Document Purpose:** Professional reference, rapid question playbook, and exam-time troubleshooting guidelines compiled from hands-on simulation labs (`CKA-PREP-2025-v2`) and real-world CKA exam patterns.

---

## Table of Contents
1. [General Exam Strategy & Time Management](#1-general-exam-strategy--time-management)
2. [Essential Aliases, Shell Hygiene & Context Management](#2-essential-aliases-shell-hygiene--context-management)
   - [Shell Setup & High-Speed Aliases](#shell-setup--high-speed-aliases)
   - [Multi-Cluster Context Hygiene (`use-context`)](#multi-cluster-context-hygiene-use-context)
   - [Namespace Context Hygiene (`kn`)](#namespace-context-hygiene-kn)
   - [The SSH Node-Hopping & Double-Exit Protocol](#the-ssh-node-hopping--double-exit-protocol)
3. [Rapid Schema Discovery & Documentation Lookup](#3-rapid-schema-discovery--documentation-lookup)
   - [Exploring Schemas Efficiently (`kubectl explain`)](#exploring-schemas-efficiently-kubectl-explain)
   - [Finding Resources and API Groups](#finding-resources-and-api-groups)
   - [Advanced Formatting via Custom Columns](#advanced-formatting-via-custom-columns)
   - [JSONPath Filtering & Output Sorting](#jsonpath-filtering--output-sorting)
4. [Control Plane & Node Diagnostic Matrix](#4-control-plane--node-diagnostic-matrix)
   - [Standard Node Triage Pipeline](#standard-node-triage-pipeline)
   - [Discovering Cluster CIDR & Pod CIDRs](#discovering-cluster-cidr--pod-cidrs)
5. [Question-by-Question Solution Playbook](#5-question-by-question-solution-playbook)
   - [Q01: MariaDB PersistentVolume & PVC Binding](#q01-mariadb-persistentvolume--pvc-binding)
   - [Q02: ArgoCD Helm Deployment & CRD Handling](#q02-argocd-helm-deployment--crd-handling)
   - [Q03: Multi-Container Pods & Sidecar Logging](#q03-multi-container-pods--sidecar-logging)
   - [Q04 & Q19: Pod Resource Allocation & Sizing Strategies](#q04--q19-pod-resource-allocation--sizing-strategies)
   - [Q05: Horizontal Pod Autoscaler (HPA)](#q05-horizontal-pod-autoscaler-hpa)
   - [Q06: Custom Resource Definitions (CRDs) Inspection](#q06-custom-resource-definitions-crds-inspection)
   - [Q07: PriorityClass & Workload Scheduling](#q07-priorityclass--workload-scheduling)
   - [Q08: CNI Management & Network Policy Troubleshooting](#q08-cni-management--network-policy-troubleshooting)
   - [Q09: cri-dockerd Runtime Installation & Kernel Forwarding](#q09-cri-dockerd-runtime-installation--kernel-forwarding)
   - [Q10: Taints, Tolerations & Worker Node Scheduling](#q10-taints-tolerations--worker-node-scheduling)
   - [Q11: Kubernetes Gateway API & HTTPRoutes](#q11-kubernetes-gateway-api--httproutes)
   - [Q12: Ingress Controller Routing & Host Configuration](#q12-ingress-controller-routing--host-configuration)
   - [Q13: NetworkPolicy Least-Permissive Security Rules](#q13-networkpolicy-least-permissive-security-rules)
   - [Q14: StorageClass Management & Default Class Patching](#q14-storageclass-management--default-class-patching)
   - [Q15A: ETCD Troubleshooting & Control Plane Recovery](#q15a-etcd-troubleshooting--control-plane-recovery)
   - [Q15B: ETCD Snapshot Backup & Restore Procedures](#q15b-etcd-snapshot-backup--restore-procedures)
   - [Q16: NodePort Services & Endpoints Validation](#q16-nodeport-services--endpoints-validation)
   - [Q17: Ingress TLS Enforcement & Protocol Verification](#q17-ingress-tls-enforcement--protocol-verification)
   - [Q18: Non-Interactive Resource Patching (`kubectl patch`)](#q18-non-interactive-resource-patching-kubectl-patch)
   - [Q20: Role-Based Access Control (RBAC) & Permission Auditing](#q20-role-based-access-control-rbac--permission-auditing)
   - [Q21: Cluster Node Upgrades via `kubeadm` (Control Plane & Worker)](#q21-cluster-node-upgrades-via-kubeadm-control-plane--worker)
6. [PSI Remote Desktop & VSCodium Productivity Hacks](#6-psi-remote-desktop--vscodium-productivity-hacks)
7. [Terminal Editor Shortcuts: Vim & Nano Quick-Reference](#7-terminal-editor-shortcuts-vim--nano-quick-reference)
   - [Vim Quick-Reference](#vim-quick-reference)
   - [Nano Quick-Reference](#nano-quick-reference)

---

## 1. General Exam Strategy & Time Management

### The 3-Tier Question Triage Model
In the official 120-minute CKA exam (15–17 questions), you have approximately **7.0 to 7.5 minutes per question**. Triage each task immediately upon reading:

1. **Tier 1 — Quick Wins (100% Solvable, < 3 mins):**
   - High-speed imperative commands (`kubectl run`, `kubectl create`, `kubectl autoscale`, `kubectl explain`).
   - Simple resource updates, scaling, PriorityClass creation, and RBAC bindings.
   - *Action:* Execute immediately, verify quickly, lock in points.
2. **Tier 2 — Standard Tasks (3–6 mins):**
   - Ingress rules, multi-container sidecars, NetworkPolicies, PVC/PV bindings, and custom columns.
   - *Action:* Draft manifests with `--dry-run=client -o yaml`, make precision edits, apply, and verify.
3. **Tier 3 — High-Risk / Debugging (> 7 mins):**
   - Broken ETCD/kubelet control-plane nodes, deep CNI routing issues, or complex multi-step templates.
   - *Rule:* **Flag and Skip.** Do not spend 15+ minutes debugging a single low-weight task early on. Return to it after completing all Tier 1 & Tier 2 questions with 20–30 minutes remaining.

> [!TIP]
> **Daily Muscle Memory Drill:** Practice solving 15–17 simulated questions daily under a strict countdown timer. Aim to finish the initial pass within 80–90 minutes so that 30 minutes remain for review.

---

## 2. Essential Aliases, Shell Hygiene & Context Management

### Shell Setup & High-Speed Aliases
The exam environment provides `kubectl` and bash autocompletion, but configure these essential shortcuts immediately in your primary terminal:
```bash
# Set current namespace shorthand
alias kn='kubectl config set-context --current --namespace'

# Export dry-run shortcuts for rapid manifest generation
export do="--dry-run=client -o yaml"
export now="--force --grace-period=0"
```

### Multi-Cluster Context Hygiene (`use-context`)
> [!CAUTION]
> **The Real CKA Killer:** The CKA exam environment has **4 to 6 distinct clusters** (`k8s`, `wk8s`, `k8s-infra`, `production`, etc.).  
> **Every single question prompt starts with a context-switch instruction:**
> ```bash
> kubectl config use-context <cluster-name>
> ```
> **Mandatory Rule:** Always copy-paste and run this command **before** reading or executing anything else in the question. If you forget, you will perform the task on the wrong cluster, earning **0 points** for both questions!

### Namespace Context Hygiene (`kn`)
> [!WARNING]
> **The Forgotten Namespace Trap:** When switching namespaces using `kn <target-ns>`, always switch back to `default` (`kn default`) once the task is complete unless the next question specifies otherwise.
> 
> If you encounter `Error: resource not found` or `Error from server (NotFound)`, immediately verify your active namespace:
> ```bash
> kubectl config view --minify | grep namespace:
> ```

### The SSH Node-Hopping & Double-Exit Protocol
Many CKA questions instruct you to SSH to a node (e.g., `node01`) and elevate to root (`sudo -i`).
> [!IMPORTANT]
> **The Double-Exit Protocol:**
> When completing work on a worker node or control-plane node:
> 1. Run `exit` $\rightarrow$ Drops from `root@node01` back to `candidate@node01`.
> 2. Run `exit` $\rightarrow$ Closes SSH connection and returns to `candidate@terminal` (the jump host).
> 3. Verify your prompt displays `candidate@terminal:~$` before moving to the next question.
> 
> *Failing to exit will cause subsequent questions to fail because worker nodes do not have cluster-wide admin kubeconfigs!*

---

## 3. Rapid Schema Discovery & Documentation Lookup

Never waste time guessing YAML keys or searching through multiple documentation pages. Use `kubectl explain` directly in the terminal:

### Exploring Schemas Efficiently (`kubectl explain`)
```bash
# View top-level fields
kubectl explain <resource>

# Drill down into nested specifications
kubectl explain <resource>.<child_field>
# Examples:
kubectl explain gateway.spec.listeners.tls
kubectl explain deployment.spec.template.spec.priorityClassName

# Inspect the full schema hierarchy as a treeview
kubectl explain <resource> --recursive

# Identify required fields rapidly
kubectl explain <resource> --recursive | grep -B 2 -i "required"
```

### Finding Resources and API Groups
```bash
# List all supported API resources, short names, and whether they are namespaced
kubectl api-resources

# Filter by keyword or group
kubectl api-resources | grep -i storage
```

### Advanced Formatting via Custom Columns
When a question forbids full JSON/YAML output or demands specific tabular summaries:
```bash
# Extract Pod container names and images
kubectl get pods test-pod -o custom-columns=CONTAINER:.spec.containers[0].name,IMAGE:.spec.containers[0].image

# Extract Custom Resource Definitions (CRDs) with Name and Age
kubectl get crd -o custom-columns=NAME:.metadata.name,AGE:.metadata.creationTimestamp
```

### JSONPath Filtering & Output Sorting
Exam questions frequently ask to extract specific fields or sort output:
```bash
# Sort Pods by creation timestamp or start time
kubectl get pods -A --sort-by=.metadata.creationTimestamp
kubectl get pods -n default --sort-by=.status.startTime

# Extract internal IP addresses of all nodes
kubectl get nodes -o jsonpath='{.items[*].status.addresses[?(@.type=="InternalIP")].address}'

# Extract Pod names and IP addresses with tab spacing
kubectl get pods -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.podIP}{"\n"}{end}'
```

---

## 4. Control Plane & Node Diagnostic Matrix

### Standard Node Triage Pipeline
When static pods crash or node services fail, follow this standardized diagnostic pipeline:

```bash
# 1. Inspect kubelet status and recent system logs
sudo systemctl status kubelet
sudo journalctl -u kubelet -n 50 --no-pager

# 2. Inspect container runtime status
sudo crictl ps -a
sudo crictl logs <container-id>

# 3. Reload systemd daemon if service unit files were modified
sudo systemctl daemon-reload
sudo systemctl restart kubelet
```

### Discovering Cluster CIDR & Pod CIDRs
When troubleshooting CNI plugins (Flannel, Calico) or kube-proxy:
```bash
# Priority 1: Check Kube-Controller-Manager static pod manifest
grep -i "cluster-cidr" /etc/kubernetes/manifests/kube-controller-manager.yaml

# Priority 2: Check running controller-manager process arguments
ps aux | grep cluster-cidr

# Priority 3: Check Pod CIDR assigned to a specific node
kubectl get node <node-name> -o jsonpath='{.spec.podCIDR}'
kubectl describe node <node-name> | grep -i podcidr

# Priority 4: Check Kubeadm ConfigMap
kubectl get cm -n kube-system kubeadm-config -o yaml | grep -i podSubnet
```

---

## 5. Question-by-Question Solution Playbook

---

### Q01: MariaDB PersistentVolume & PVC Binding
* **Domain:** Storage / Persistent Volumes
* **Difficulty:** Medium
* **Objective:** Bind a new PersistentVolumeClaim (PVC) to a pre-existing PersistentVolume (PV).

#### Key Mechanics & Pitfalls
* If `storageClassName` is omitted in the PVC, Kubernetes may attempt to provision a volume dynamically using the cluster's Default StorageClass, leaving the PVC pending or unbound to the target PV.
* The PVC must match the PV's exact `accessModes`, `capacity` (request $\le$ PV capacity), and `storageClassName`.

#### Step-by-Step Execution
1. Check the properties of the existing PV:
   ```bash
   kubectl get pv
   ```
2. Note the `NAME`, `CAPACITY`, `ACCESS MODES`, and `STORAGECLASS`.
3. Create or update the PVC manifest:
   ```yaml
   apiVersion: v1
   kind: PersistentVolumeClaim
   metadata:
     name: mariadb-pvc
     namespace: default
   spec:
     accessModes:
       - ReadWriteOnce
     storageClassName: standard   # Must match PV's storageClassName exactly
     volumeName: mariadb-pv       # Optional: guarantees binding directly to target PV
     resources:
       requests:
         storage: 1Gi
   ```
4. Verify the binding:
   ```bash
   kubectl get pvc mariadb-pvc
   # STATUS must show "Bound"
   ```

---

### Q02: ArgoCD Helm Deployment & CRD Handling
* **Domain:** Helm / Packaging
* **Difficulty:** Hard (Needs careful flag configuration)
* **Objective:** Deploy ArgoCD using Helm chart `argocd/argo-cd` with specific flags.

#### Key Mechanics & Pitfalls
* Helm commands run in the namespace specified by `--namespace <ns>`, **not** your active `kn` context.
* If Custom Resource Definitions (CRDs) already exist or if the exam forbids CRD installation, you must pass `--set crds.install=false`.

#### Step-by-Step Execution
1. Search the repository to confirm chart name and versions:
   ```bash
   helm search repo argocd
   ```
2. Inspect available values if needed:
   ```bash
   helm show values argocd/argo-cd | less
   # Inside less, search for CRD settings: /crds
   ```
3. Install or template the release:
   ```bash
   helm install argocd argocd/argo-cd \
     --namespace argocd \
     --create-namespace \
     --set crds.install=false
   ```
4. Verification:
   ```bash
   helm list -n argocd
   kubectl get pods -n argocd
   ```

---

### Q03: Multi-Container Pods & Sidecar Logging
* **Domain:** Workloads & Scheduling
* **Difficulty:** Easy–Medium
* **Objective:** Add a sidecar container to an existing workload to process logs from a shared volume.

#### Key Mechanics & Pitfalls
* **YAML Syntax:** `spec.containers` is a list. Every container definition must start with a hyphen `- name: ...`.
* Shared volumes must use an `emptyDir: {}` mounted by both containers.

#### Step-by-Step Execution
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-sidecar
spec:
  volumes:
    - name: shared-logs
      emptyDir: {}
  containers:
    - name: app
      image: busybox
      command: ["/bin/sh", "-c", "while true; do echo $(date) >> /var/log/app.log; sleep 1; done"]
      volumeMounts:
        - name: shared-logs
          mountPath: /var/log
    - name: sidecar
      image: busybox
      command: ["/bin/sh", "-c", "tail -n+1 -F /var/log/app.log"]
      volumeMounts:
        - name: shared-logs
          mountPath: /var/log
```

---

### Q04 & Q19: Pod Resource Allocation & Sizing Strategies
* **Domain:** Workloads / Resource Management
* **Difficulty:** Medium
* **Objective:** Configure balanced CPU and Memory requests and limits to prevent `OOMKilled` or `CrashLoopBackOff`.

#### Practical Allocation Heuristic
* **Limits vs. Requests:**
  - `requests`: Reserved by the scheduler.
  - `limits`: Hard cap before throttling (CPU) or termination (`OOMKilled` for Memory).
* Check node allocatable resources:
  ```bash
  kubectl describe nodes | grep -A 8 Allocatable
  ```
* Standard balanced baseline for typical CKA practice questions:
  - `CPU`: Requests `150m` (or `100m–150m`), Limits `250m–300m`.
  - `Memory`: Requests `200Mi`, Limits `400Mi–500Mi`.

#### Imperative Application
```bash
# Set resource requests and limits non-interactively
kubectl set resources deployment wordpress \
  --requests="cpu=150m,memory=250Mi" \
  --limits="cpu=200m,memory=300Mi"
```

#### Verification
```bash
# Trigger and monitor rollout
kubectl rollout status deployment wordpress
kubectl get pods -l app=wordpress
# Ensure all pods transition to 1/1 Running within 15–30 seconds
```

---

### Q05: Horizontal Pod Autoscaler (HPA)
* **Domain:** Workloads / Scaling
* **Difficulty:** Easy
* **Objective:** Configure an HPA target with minimum/maximum replicas and target CPU utilization.

#### Step-by-Step Execution
1. Generate the HPA imperatively:
   ```bash
   kubectl autoscale deployment backend \
     --name=backend-hpa \
     --cpu-percent=50 \
     --min=2 \
     --max=8
   ```
   > [!IMPORTANT]
   > Always specify `--name=<name>` if the question names the HPA differently from the target deployment.
2. Inspect schema for advanced metrics or stabilization windows:
   ```bash
   kubectl explain hpa.spec.behavior.scaleDown
   ```
3. Verification:
   ```bash
   kubectl get hpa backend-hpa
   ```

---

### Q06: Custom Resource Definitions (CRDs) Inspection
* **Domain:** Cluster Architecture / Extensibility
* **Difficulty:** Easy
* **Objective:** Identify, filter, and inspect specific CRDs (e.g., `cert-manager`).

#### Key Mechanics & Pitfalls
* **CRDs are cluster-scoped**, not namespaced. Running `kubectl get all -n <namespace>` will **never** return CRDs.

#### Step-by-Step Execution
```bash
# List all CRDs matching keyword
kubectl get crd | grep cert-manager

# Extract specific columns using custom-columns
kubectl get crd -o custom-columns=NAME:.metadata.name,CREATED:.metadata.creationTimestamp

# Drill into CRD schema specifications
kubectl explain <crd-name> --recursive
```

---

### Q07: PriorityClass & Workload Scheduling
* **Domain:** Scheduling & Eviction
* **Difficulty:** Easy
* **Objective:** Create a PriorityClass and apply it to an application deployment.

#### Step-by-Step Execution
1. Create PriorityClass imperatively:
   ```bash
   kubectl create priorityclass high-priority --value=1000000 --description="High priority workloads"
   ```
2. Verify existing PriorityClasses:
   ```bash
   kubectl get priorityclass
   ```
3. Patch the deployment manifest:
   ```yaml
   spec:
     template:
       spec:
         priorityClassName: high-priority
   ```
4. Restart deployment and verify:
   ```bash
   kubectl rollout restart deployment <deployment-name>
   kubectl get pods -o wide --show-priority
   ```

---

### Q08: CNI Management & Network Policy Troubleshooting
* **Domain:** Cluster Maintenance / Networking
* **Difficulty:** Hard
* **Objective:** Fix or migrate CNI plugins (Flannel $\leftrightarrow$ Calico) and recover CoreDNS.

#### Key Mechanics & Pitfalls
* CNI changes may leave stale network routes on the node. Restart kubelet:
  ```bash
  sudo systemctl restart kubelet
  ```
* Flannel verifies its ConfigMap `Network` CIDR against the node's `podCIDR`. Ensure they match:
  ```bash
  kubectl describe node | grep -i podcidr
  kubectl edit cm kube-flannel-cfg -n kube-system
  # Ensure "Network": "10.244.0.0/16" aligns with node podCIDR
  ```
* If `CoreDNS` pods enter `CrashLoopBackOff` after a CNI update, perform a clean rollout restart:
  ```bash
  kubectl rollout restart deployment coredns -n kube-system
  ```

---

### Q09: cri-dockerd Runtime Installation & Kernel Forwarding
* **Domain:** Cluster Maintenance / Architecture
* **Difficulty:** Medium–Hard
* **Objective:** Install `cri-dockerd` package and enable required kernel bridging/forwarding parameters.

#### Step-by-Step Execution (Root / sudo required)
1. Install package:
   ```bash
   sudo dpkg -i cri-dockerd.deb
   ```
2. Enable and start the systemd unit:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable --now cri-docker.service cri-docker.socket
   sudo systemctl status cri-docker.service
   ```
3. Configure persistent sysctl network forwarding in `/etc/sysctl.d/k8s.conf`:
   ```bash
   cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
   net.bridge.bridge-nf-call-iptables  = 1
   net.bridge.bridge-nf-call-ip6tables = 1
   net.ipv4.ip_forward                 = 1
   EOF
   ```
4. Apply kernel parameters immediately without reboot:
   ```bash
   sudo sysctl --system
   ```

---

### Q10: Taints, Tolerations & Worker Node Scheduling
* **Domain:** Workloads & Scheduling
* **Difficulty:** Medium
* **Objective:** Schedule pods onto a tainted worker node (e.g. `node01`) without directly modifying node configurations via SSH.

#### Key Mechanics & Pitfalls
* You do **not** need to SSH into worker nodes to deploy pods. The control plane `kube-scheduler` places pods on tainted nodes if the pod manifest declares matching tolerations.

#### Syntax Guide
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secured-app
spec:
  nodeSelector:
    kubernetes.io/hostname: node01   # Optional: guarantees placement on specific node
  tolerations:
    - key: "tier"
      operator: "Equal"
      value: "special"
      effect: "NoSchedule"
  containers:
    - name: nginx
      image: nginx
```
> [!NOTE]
> If matching any value for a given key, omit `value` and use `operator: "Exists"`.

---

### Q11: Kubernetes Gateway API & HTTPRoutes
* **Domain:** Networking / Services
* **Difficulty:** Medium–Hard
* **Objective:** Configure a Gateway resource and associated HTTPRoute for ingress routing.

#### Key Mechanics & Pitfalls
* **Port 443:** TLS listeners must specify port `443` and reference a valid TLS secret.
* Discover Gateway API custom resources:
  ```bash
  kubectl get gateway,httproutes -A
  kubectl explain gateway.spec.listeners.tls
  ```

#### Example Gateway Manifest
```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: external-gateway
  namespace: default
spec:
  gatewayClassName: standard
  listeners:
    - name: https
      protocol: HTTPS
      port: 443
      tls:
        mode: Terminate
        certificateRefs:
          - name: tls-secret
```

---

### Q12: Ingress Controller Routing & Host Configuration
* **Domain:** Networking / Services
* **Difficulty:** Medium
* **Objective:** Expose a service via Ingress with domain matching and test connectivity.

#### Step-by-Step Execution
1. Generate Ingress imperatively:
   ```bash
   kubectl create ingress test-ingress \
     --rule="example.org/echo=echo-service:8080"
   ```
2. Retrieve internal cluster / node IP:
   ```bash
   kubectl get nodes -o wide
   # Note the INTERNAL-IP
   ```
3. Map the domain name in `/etc/hosts`:
   ```bash
   sudo sh -c 'echo "<Node-IP> example.org" >> /etc/hosts'
   ```
4. Verify routing:
   ```bash
   curl -I http://example.org/echo
   ```

---

### Q13: NetworkPolicy Least-Permissive Security Rules
* **Domain:** Security / Networking
* **Difficulty:** Hard
* **Objective:** Enforce least-permissive ingress policies allowing only authorized namespaces and IP ranges.

#### Critical Syntax Rules
* `ingress: [{}]` $\rightarrow$ **Allows all incoming traffic.**
* `ingress: []` $\rightarrow$ **Blocks all incoming traffic.**
* Multiple list items under `from:` evaluate as logical **OR**:
  ```yaml
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              project: frontend
        - ipBlock:
            cidr: 172.16.0.0/16
            except:
              - 172.16.1.50/32
  ```
* Combined fields within the **same** list item evaluate as logical **AND**:
  ```yaml
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              project: frontend
          podSelector:
            matchLabels:
              role: client
  ```

---

### Q14: StorageClass Management & Default Class Patching
* **Domain:** Storage
* **Difficulty:** Easy
* **Objective:** Create a StorageClass and set it as the cluster-wide default class.

#### Setting Default StorageClass via `kubectl patch`
```bash
# 1. Unset existing default StorageClass (if one exists)
kubectl patch storageclass old-default -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"false"}}}'

# 2. Set new default StorageClass
kubectl patch storageclass standard -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'

# 3. Verify (look for "(default)" next to the name)
kubectl get storageclass
```

---

### Q15A: ETCD Troubleshooting & Control Plane Recovery
* **Domain:** Troubleshooting / Cluster Architecture
* **Difficulty:** Hard (Time-Consuming)
* **Objective:** Diagnose and repair a non-starting static ETCD pod.

#### Diagnostic Checklist
1. Check kubelet unit status:
   ```bash
   sudo systemctl status kubelet
   ```
2. Check exited/failing static pod containers:
   ```bash
   sudo crictl ps -a
   sudo crictl logs <etcd-container-id>
   ```
3. Inspect static manifest directory (`/etc/kubernetes/manifests/etcd.yaml`):
   - Check file paths for certificates (`ca.crt`, `server.crt`, `server.key`).
   - Check data directory path (`--data-dir`).
   - Check listen peer/client URLs and initial cluster flags.
4. Once edited, kubelet will automatically reload the static pod within 10–20 seconds.
> [!WARNING]
> If troubleshooting ETCD takes more than 5 minutes during the exam, flag the question and proceed to other tasks immediately.

---

### Q15B: ETCD Snapshot Backup & Restore Procedures
* **Domain:** Cluster Architecture, Installation & Configuration
* **Difficulty:** Medium (Guaranteed Exam Question: ~8%)
* **Objective:** Take an ETCD snapshot and restore the cluster state from a backup file.

#### Step 1: Extract PKI Credentials from Manifest
Inspect `/etc/kubernetes/manifests/etcd.yaml` on the Control Plane to locate:
- `--cacert=/etc/kubernetes/pki/etcd/ca.crt`
- `--cert=/etc/kubernetes/pki/etcd/server.crt`
- `--key=/etc/kubernetes/pki/etcd/server.key`

#### Step 2: Save the Snapshot
```bash
ETCDCTL_API=3 etcdctl --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key \
  snapshot save /tmp/etcd-backup.db
```

#### Step 3: Verify the Snapshot Integrity
```bash
ETCDCTL_API=3 etcdctl snapshot status /tmp/etcd-backup.db --write-out=table
```

#### Step 4: Restore Snapshot to a New Data Directory
```bash
ETCDCTL_API=3 etcdctl snapshot restore /tmp/etcd-backup.db \
  --data-dir=/var/lib/etcd-backup
```

#### Step 5: Update the Static Pod Manifest
Edit `/etc/kubernetes/manifests/etcd.yaml` to point to the new data directory:
```yaml
spec:
  volumes:
    - name: etcd-data
      hostPath:
        path: /var/lib/etcd-backup   # Update from /var/lib/etcd
        type: DirectoryOrCreate
```
*Wait 30 seconds for kubelet to restart the ETCD static pod and confirm health:*
```bash
kubectl get pods -n kube-system -l component=etcd
```

---

### Q16: NodePort Services & Endpoints Validation
* **Domain:** Networking / Services
* **Difficulty:** Medium
* **Objective:** Expose a workload externally via NodePort and verify backend endpoint registration.

#### Port Terminology
* `port`: Cluster-internal Service port.
* `targetPort`: Port the container is actually listening on.
* `nodePort`: External port on worker nodes (range: 30000–32767).

#### Imperative Creation & Endpoints Inspection
```bash
# Expose deployment
kubectl expose deployment webapp --type=NodePort --port=80 --target-port=8080 --name=webapp-svc

# Check endpoints
kubectl get svc,ep -l app=webapp
```
> [!TIP]
> If `ENDPOINTS` shows `<none>`, verify that the service's `selector` labels match the Pod's `metadata.labels` exactly.

---

### Q17: Ingress TLS Enforcement & Protocol Verification
* **Domain:** Security / Networking
* **Difficulty:** Medium–Hard
* **Objective:** Enforce TLS 1.3 protocol restrictions in Ingress Controller and verify with `curl`.

#### Execution Steps
1. Locate Ingress Controller ConfigMap:
   ```bash
   kubectl get cm -n ingress-nginx
   ```
2. Edit ConfigMap to enforce TLS 1.3:
   ```bash
   kubectl edit cm ingress-nginx-controller -n ingress-nginx
   # Add or modify:
   # data:
   #   ssl-protocols: "TLSv1.3"
   ```
3. Restart Ingress Controller pods to load new configuration:
   ```bash
   kubectl rollout restart deployment ingress-nginx-controller -n ingress-nginx
   kubectl rollout status deployment ingress-nginx-controller -n ingress-nginx
   ```
4. Map domain to service IP in `/etc/hosts`.

#### Validation with `curl`
* **Test 1 — Reject TLS 1.2:**
  ```bash
  curl -vk --tls-max 1.2 https://ckaquestion.k8s.local
  ```
  *Expected Output:* Protocol version alert error (success):
  ```text
  * TLSv1.2 (IN), TLS alert, protocol version (582):
  curl: (35) error:0A00042E:SSL routines::tlsv1 alert protocol version
  ```
* **Test 2 — Accept TLS 1.3:**
  ```bash
  curl -vk --tlsv1.3 https://ckaquestion.k8s.local
  ```
  *Expected Output:* Handshake finishes successfully and returns `HTTP/2 200` or `HTTP/1.1 200 OK`.

---

### Q18: Non-Interactive Resource Patching (`kubectl patch`)
* **Domain:** Workloads / Troubleshooting
* **Difficulty:** Easy–Medium
* **Objective:** Modify deployments when interactive editing (`kubectl edit`) is disabled or forbidden.

#### Direct Patching
```bash
# Update pod template spec non-interactively
kubectl patch deployment resource-app -p '{"spec":{"template":{"spec":{"containers":[{"name":"app","image":"nginx:1.24"}]}}}}'
```

#### Alternative: Export, Modify & Replace
```bash
kubectl get deployment resource-app -o yaml > dep.yaml
# Edit dep.yaml in VSCodium or vim
kubectl replace -f dep.yaml
# Or: kubectl apply -f dep.yaml
```

---

### Q20: Role-Based Access Control (RBAC) & Permission Auditing
* **Domain:** Cluster Architecture / Security (~10% Exam Weight)
* **Difficulty:** Easy–Medium
* **Objective:** Create scoped Roles and RoleBindings, then audit permissions using `kubectl auth can-i`.

#### Step 1: Create Namespaced Role & RoleBinding Imperatively
```bash
# Create Role
kubectl create role pod-reader \
  --verb=get,list,watch \
  --resource=pods \
  --namespace=engineering

# Bind Role to a ServiceAccount
kubectl create rolebinding pod-reader-binding \
  --role=pod-reader \
  --serviceaccount=engineering:deploy-sa \
  --namespace=engineering
```

#### Step 2: Create Cluster-Wide ClusterRole & Binding
```bash
# ClusterRole across all namespaces
kubectl create clusterrole deployment-manager \
  --verb=get,list,create,update,delete \
  --resource=deployments.apps

# Bind ClusterRole to a specific user
kubectl create clusterrolebinding dep-mgr-binding \
  --clusterrole=deployment-manager \
  --user=jane
```

#### Step 3: Crucial Verification with `auth can-i`
> [!IMPORTANT]
> Always verify RBAC with `kubectl auth can-i` using the `--as` impersonation flag:
```bash
# Test ServiceAccount permissions in a namespace
kubectl auth can-i list pods --namespace=engineering --as=system:serviceaccount:engineering:deploy-sa
# Output must be: yes

kubectl auth can-i delete pods --namespace=engineering --as=system:serviceaccount:engineering:deploy-sa
# Output must be: no

# Test User permissions
kubectl auth can-i create deployments --as=jane
# Output must be: yes
```

---

### Q21: Cluster Node Upgrades via `kubeadm` (Control Plane & Worker)
* **Domain:** Cluster Architecture, Installation & Configuration (~10% Exam Weight)
* **Difficulty:** Medium–Hard
* **Objective:** Upgrade control-plane and worker nodes safely to a target minor version (e.g., from v1.30.x to v1.31.0).

#### Phase 1: Control Plane Upgrade
1. **Drain the Control Plane node (from candidate jump host):**
   ```bash
   kubectl drain controlplane --ignore-daemonsets --delete-emptydir-data
   ```
2. **SSH to control plane and elevate:**
   ```bash
   ssh controlplane
   sudo -i
   ```
3. **Upgrade `kubeadm` package:**
   ```bash
   sudo apt-mark unhold kubeadm
   sudo apt-get update && sudo apt-get install -y kubeadm=1.31.0-1.1
   sudo apt-mark hold kubeadm
   kubeadm version
   ```
4. **Plan and apply upgrade:**
   ```bash
   sudo kubeadm upgrade plan
   sudo kubeadm upgrade apply v1.31.0 -y
   ```
5. **Upgrade `kubelet` and `kubectl`:**
   ```bash
   sudo apt-mark unhold kubelet kubectl
   sudo apt-get install -y kubelet=1.31.0-1.1 kubectl=1.31.0-1.1
   sudo apt-mark hold kubelet kubectl
   sudo systemctl daemon-reload && sudo systemctl restart kubelet
   ```
6. **Exit back to candidate jump host & uncordon:**
   ```bash
   exit   # Leave root
   exit   # Leave SSH
   kubectl uncordon controlplane
   ```

#### Phase 2: Worker Node Upgrade
1. **Drain the worker node (from candidate jump host):**
   ```bash
   kubectl drain node01 --ignore-daemonsets --delete-emptydir-data
   ```
2. **SSH to worker node and elevate:**
   ```bash
   ssh node01
   sudo -i
   ```
3. **Upgrade `kubeadm` package:**
   ```bash
   sudo apt-mark unhold kubeadm
   sudo apt-get update && sudo apt-get install -y kubeadm=1.31.0-1.1
   sudo apt-mark hold kubeadm
   ```
4. **Upgrade node configuration (Worker node command):**
   ```bash
   sudo kubeadm upgrade node
   ```
5. **Upgrade `kubelet` and `kubectl`:**
   ```bash
   sudo apt-mark unhold kubelet kubectl
   sudo apt-get install -y kubelet=1.31.0-1.1 kubectl=1.31.0-1.1
   sudo apt-mark hold kubelet kubectl
   sudo systemctl daemon-reload && sudo systemctl restart kubelet
   ```
6. **Exit back to candidate jump host & uncordon:**
   ```bash
   exit   # Leave root
   exit   # Leave SSH
   kubectl uncordon node01
   kubectl get nodes   # Verify VERSION displays v1.31.0 and STATUS displays Ready
   ```

---

## 6. PSI Remote Desktop & VSCodium Productivity Hacks

### Integrated VSCodium Workflow
1. **Launch VSCodium:** Open via `Applications -> Accessories -> VSCodium`.
2. **Integrated Terminal:** Press ``Ctrl + ` `` or `Ctrl + Shift + P -> View: Toggle Terminal`.
3. **Dual-Pane Setup:**
   - Left side: VSCodium text editor for YAML files and scratch notes.
   - Right side: Terminal for executing `kubectl` commands.
4. **Copy & Paste Conventions:**
   - Linux / XFCE Terminal shortcut: `Ctrl + Shift + C` (Copy) and `Ctrl + Shift + V` (Paste).
   - In VSCodium: Standard `Ctrl + C` and `Ctrl + V`.
5. **Exam Browser URL Allowlist:**
   Remember that the PSI browser strictly limits external browsing to:
   - `https://kubernetes.io/docs`
   - `https://kubernetes.io/blog`
   - `https://helm.sh/docs`
   - `https://gateway-api.sigs.k8s.io`

---

## 7. Terminal Editor Shortcuts: Vim & Nano Quick-Reference

When editing YAML manifests on remote worker or control-plane nodes where graphical editors (like VSCodium) are unavailable, knowing rapid navigation, search, and line deletion shortcuts is essential.

### Vim Quick-Reference

#### Line Deletion, Cutting & Pasting
| Command | Action | Description |
| :--- | :--- | :--- |
| `dd` | Delete (cut) line | Deletes the current line |
| `3dd` or `<N>dd` | Delete (cut) `N` lines | Deletes `N` lines downward from the cursor |
| `D` or `d$` | Delete to end of line | Deletes from cursor position to line end |
| `d0` or `d^` | Delete to start of line | Deletes from cursor to beginning / first character |
| `dw` / `d2w` | Delete word(s) | Deletes current word / next 2 words |
| `V` $\rightarrow$ `j`/`k` $\rightarrow$ `d` | Visual line delete | Select multiple lines visually and delete |
| `dG` | Delete to end of file | Deletes from cursor position to end of file |
| `gg` $\rightarrow$ `dG` | Clear entire file | Jumps to line 1, then deletes all content |
| `p` / `P` | Paste text | Pastes deleted/yanked text below / above cursor |

#### Find & Search Shortcuts
| Command | Action | Description |
| :--- | :--- | :--- |
| `/pattern` | Search forward | Searches forward for `pattern` (press `Enter`) |
| `?pattern` | Search backward | Searches backward for `pattern` (press `Enter`) |
| `n` | Next match | Moves cursor to next match in search direction |
| `N` | Previous match | Moves cursor to previous match |
| `*` | Search word under cursor | Searches forward for exact word under cursor |
| `#` | Reverse search word | Searches backward for exact word under cursor |
| `:%s/old/new/g` | Search and replace | Replaces all occurrences of `old` with `new` across file |
| `:%s/old/new/gc` | Interactive replace | Replaces occurrences with interactive prompt (`y`/`n`/`a`/`q`) |

#### Rapid Navigation & Positioning
| Command | Action | Description |
| :--- | :--- | :--- |
| `gg` | Jump to start | Moves cursor to line 1 |
| `G` | Jump to end | Moves cursor to the last line of the file |
| `:<N>` or `<N>G` | Go to line `<N>` | Jumps directly to line number `<N>` (e.g. `:42` or `42G`) |
| `0` (zero) / `^` | Start of line | Jumps to column 0 / first non-whitespace character |
| `$` | End of line | Jumps to the last character of current line |
| `w` / `b` | Next / previous word | Jumps forward / backward by one word |

#### Undo, Redo & File Operations
| Command | Action | Description |
| :--- | :--- | :--- |
| `u` | Undo | Reverts last change |
| `Ctrl + r` | Redo | Re-applies last undone change |
| `:w` | Save | Writes changes to disk |
| `:wq` or `ZZ` | Save and exit | Saves changes and closes Vim |
| `:q!` or `ZQ` | Force quit | Exits without saving changes |

#### Essential YAML Configuration (`~/.vimrc`)
Set these in `~/.vimrc` or during an active session using `:` for flawless indentation and alignment:
```vim
:set number        " Display line numbers
:set expandtab     " Insert spaces when tab is pressed
:set tabstop=2     " Number of visual spaces per tab
:set shiftwidth=2  " Indentation amount for >> and <<
:set autoindent    " Align new line with previous indentation
:set paste         " Disable auto-indent interpretation when pasting YAML
:set nopaste       " Re-enable normal editing mode after pasting
```

---

### Nano Quick-Reference

#### Line Deletion, Cutting & Pasting
| Key Combination | Action | Description |
| :--- | :--- | :--- |
| `Ctrl + K` | Cut line (Delete) | Cuts from cursor to line end (deletes entire line if cursor is at column 0) |
| `Ctrl + U` | Uncut (Paste) | Pastes contents of cutbuffer at current cursor position |
| `Alt + 6` (or `M-6`) | Copy line | Copies current line into cutbuffer without deleting it |
| `Ctrl + ^` (or `Alt + A`) | Mark text | Starts text selection; move cursor and press `Ctrl + K` to cut selected block |

#### Find & Replace Shortcuts
| Key Combination | Action | Description |
| :--- | :--- | :--- |
| `Ctrl + W` | Where is (Find) | Opens search prompt to search text forward |
| `Alt + W` (or `M-W`) | Repeat search | Jumps to next search match |
| `Ctrl + \` (or `Alt + R`) | Replace | Prompts for search string and replacement string |

#### Navigation & Positioning
| Key Combination | Action | Description |
| :--- | :--- | :--- |
| `Ctrl + _` (or `Alt + G`) | Go to line | Prompts for line and column number |
| `Ctrl + A` | Home | Moves cursor to start of current line |
| `Ctrl + E` | End | Moves cursor to end of current line |
| `Ctrl + Y` (or `Page Up`) | Previous page | Scrolls up one full screen |
| `Ctrl + V` (or `Page Down`)| Next page | Scrolls down one full screen |

#### Undo, Redo & File Operations
| Key Combination | Action | Description |
| :--- | :--- | :--- |
| `Alt + U` | Undo | Undoes last action |
| `Alt + E` | Redo | Redoes last undone action |
| `Ctrl + O` $\rightarrow$ `Enter` | Write Out | Saves changes to file |
| `Ctrl + X` | Exit | Quits nano (prompts to save if buffer is modified) |
| `Alt + N` | Toggle line numbers | Toggles line number display (or launch with `nano -l <file>`) |
