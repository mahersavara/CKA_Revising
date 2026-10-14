## Question
1. What should I do from easy to hard question (100% you could do, fastest implement to complex)
2. Guidance through question (needed)?
3. How to check tls for work, I always run into hang or 404 (rule not work :( )  ?


maybe I only need this:
alias kn='k config set-context --current --namespace'
k api-resources

-- to return to the original namespace: kn default

** When running to namespace not found error -> remember to have you set the namespace back to default ? **

---

systemctl status
crictl ps -a
k rollout
k path dep name -p='metadata'

-- 
sudo systemctl daemon-reload 

cidr -> go to kube-controller-manager.yaml (priority) || ps aux | grep cluster-cidr || node -> spec.podCidr (rember to modify for flannel to 16) 


--- Note
      value     <string> -required- -> from the recursive -> you could see things require

- From easy to hard question:
1. Quest 6: crds (4/5)
- if I don't remember a field, I should run `kubectl explain <resource>` to see the child inside it
- I could use k `k explain <resource.child_field>` for nested field 
- I could use k `k explain <resource> --recursive` to see all fields in treeview
- I could use `k api-resources` to list all available resources

-- in the 2nd attempt: I use k get all --namespace=cert (follow the condition of question) -> I wrong
list all cert-manager [CRDS] -> key word is: cert-manager -> grep all cert-manager.
should use `k get crd | grep cert-manager` 
- use tee for root ?

--hint: you just need to k get pods --help -> will get this

 # List resource information in custom columns
  kubectl get pod test-pod -o custom-columns=CONTAINER:.spec.containers[0].name,IMAGE:.spec.containers[0].image

- In the get, to get collumn name I could use `k get <resource> -o name` -> special for collumn name
then use `| grep <what want to search>` to get all the line have search value
    - For example:
        `kubectl get crd | grep cert-manager` to list all crd have name "cert-manager"
- to get other collumn name I could use `kubectl get crd -o custom-columns=NAME:.metadata.name,AGE:.metadata.creationTimestamp` to list all crd with custom columns

2. Ques 18: patch (4/5)
- one remark for this question is that you should remember `k patch deployment resource-app -p=`<content in yaml with change>``
- Note: with this type question, they prohibit from using `k edit` so we use `k get deployments.apps resource-app -o yaml > dep.yaml` instead to get yaml file to get the configuration or just `k get deployments.app resource-app -o yaml` is ok

3. Ques 13: network policy (4/5)
- a friendly note that if someone get the networkpolicies.yaml with this content
```yaml
    ingress:
    - {}
```
this is allow all traffic, not block
```yaml
ingress:
- from:
  - namespaceSelector: ... (namespace frontend)
  - ipBlock:
      cidr: 172.16.0.0/16 
```
this is example for allow traffic from frontend namespace and ipBlock 172.16.0.0/16
-> ipblock = block of ip -- nó nghĩa là khối ip á ở đây nghĩa là cho phép
-> chặn -> dùng khóa except:
```yaml
ingress:
- from:
  - except:
    - namespaceSelector: ... (namespace frontend)
  - ipBlock:
      cidr: 172.16.0.0/16 
      except:
      - 10.96.1.50/32 # allow all except this ip
```

- least permissive -> quyền hạn tối thiểu nhất, chỉ vừa đủ cho frontend thôi - could be restrict 
- Đối nghĩa có thể là: Most permissive, Broadest access / Widest access

4. Ques 7 - priority class --- cai nay sieu de, chi can chiu kho explain ti la xong (4/5)
- `k get priorityclass`
- `k explain deployment.spec.template.spec.priorityClassName`
- `k create priorityclass ...`
- `k rollout restart deployment ...` -> not really necessary cause it will rolling update the pod. so just rollout restart deployment for safety
- `k get pod -n relative --show-priority` -> show pod priority

5. Ques 10 -- not familiar with yet, need to practice more for muscle memory (4/5)
- this ques have details doc, you could take this as guidance: https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/
- you can delete the operator:"exists" when create pod for faster command apply
- you don't have to ssh worker node to make pod, the question is to schedule on node01, so we have condition taint -> make rule for node -> then we do making pod with toleration -> the kube-scheduler will check it and see it have taint -> redirect to correct node.

- there's not much to say, just taint --help && create pod from docs is ok


6. Ques 16 Nodeport - need to practice with more example (4/5)
- 2nd time: trick in port & nodeport -> must becareful -> k explain will help for deployment expose container.
- using k explain will help you a alot cause it also have example to guide 
- Tips: 1 tab for explain, 1 tab to do
- becareful e.g : nodeport 30080 vs nodeport, targetPort: 30080 -> these are different.
- insight: you could also check endpoint `k get svc,ep -n relative` from here (get many resource)


13. Ques 5 HPA: (4/5)
 - I guess this one should be easy, could count as svc - expose, don't take too much time
- Actually this lab is quite easy, all you need is k get hpa, k autoscale (same structure as svc) 
- k explain hpa -> only need to know the structure of stabilizationWindowSeconds structure so it should be fine, If you remember the structure well as svc, then this one should be easy to do.

- 2nd attemp: should have --name -> distinct with the deployment name



7. Ques 14 - StorageClass (4/5)
- The bestway to do this is open docs -> storageclass -> the first page + combine with `k explain storageclasses.
-> yep 2nd time, check docs
- just need to take necessary from docs (only necessary fields)
- then for the patch we can get yaml file by `k get storageclasses.storage.k8s.io storageclass-name -o yaml` then patch it with `k patch storageclasses.storage.k8s.io <storageclass-name> -p='<yaml-content-of-metadata.annotations>' (get from the yaml files, then reflect with the docs to get necessary fields)

8. Ques 3 - Sidecar containers (4/5)
- The easiest way to do this is to open docs - sidecar container but dont create initContainer like that, just refer to the volume & volume mount & commands if the default don't have
- We only need to coppy shared storage for that
- oh shit, remember deeply: `Trong YAML, containers: là một danh sách (List). Mỗi container phải bắt đầu bằng một dấu gạch ngang - riêng biệt.`
- remember volume mount where command lie, in this case it's /var/log

9. Ques 1 MariaDB persistent volume (4/5)
- For this question, you should notice to open docs for config of pvc
- Notice this line "Deployment file located at" to get the correct one 
- ensure the storageclassname: standard -> ensure "data" reusing the available PV -> 
    1. `k get pv` -> see the current PV's storageclass
    2. from that name -> k edit pvc -> storageClassName: <name> -> to reuse
    Nếu bạn bỏ trống storageClassName trong PVC, K8s sẽ đi tìm một PV không có storageclass hoặc tìm Default StorageClass, nên sẽ không bao giờ nhận mariadb-pv.
- or we could use volumeName for persistentVolumeClaim to ensure (volumeName: <pv-name>) -> in this way no need for storageclass

10. Ques 12 Ingress -- not familiar with yet, need more practice -- (from easy to medium) (4/5)

-- phan tich: http://example.org/echo -> cos example.org + echo -> host: "example.org" path: echo


- actually this ques is quite easy
- we only need k expose --help  -> get the command
- and k explain ingress to see the structure of yaml file -> we can check by k api-resource -> k create ingress --help for more information.
- remember to add the ip and host to the /etc/host file in order to make it right.
- hostname -I -> lấy ip máy
- in this case we could use both 127.0.0.1 (always - không lo bị đổi ip) or ip of the host: <hostname -I> ( ip có thể thay đổi)
- hostname -I : 1. ip of the host (node IP) 2. lo /eth0 ip khởi tạo k8s ban đầu, cho vô etcd và kube-apiserver, 3. ip flannel, 4. cni0: ip gateway
- other way to get nodeIP: k get nodes -o wide -> look at the INTERNAL-IP -> that the node ip we looking

11. Ques 17 TLS Config -- not familiar with yet, need more practice -- (from easy to medium) (4/5)

-- guidance after 2nd time -> need rollout restart deployment after change configmap for work!!!!
- How to check this for work, I always run into hang or 404 (rule not work :( )  ?

- oh this one is easier than I thought 
- steps: 
    1. check the namespace -> edit the configmap, don't forget to edit in the etc/hosts also
    2. to edit in the etc/hosts -> get svc ip -> add to host cluster ip + domain
    3. rollout inorder to get it work
    4. testing: !!! this one you should carefully notice 

```curl -vk --tls-max 1.2 https://ckaquestion.k8s.local 
*   Trying 10.111.32.184:443...
* Connected to ckaquestion.k8s.local (10.111.32.184) port 443 (#0) -> this is always okei what we want to see is the 1.2, don't care about this
* ALPN, offering h2
* ALPN, offering http/1.1
* TLSv1.0 (OUT), TLS header, Certificate Status (22): -> this is when we sent 
* TLSv1.2 (OUT), TLS handshake, Client hello (1):
* TLSv1.2 (IN), TLS header, Unknown (21): -> this is when we receive -> you see it unknow 
* TLSv1.2 (IN), TLS alert, protocol version (582): -> then alert
* error:0A00042E:SSL routines::tlsv1 alert protocol version -> then error -> this is the success that we need
* Closing connection 0
curl: (35) error:0A00042E:SSL routines::tlsv1 alert protocol version
```

- for 1.3: it would show ok then return the http 200 with content of html

```* TLSv1.3 (IN), TLS handshake, Finished (20):
* TLSv1.2 (OUT), TLS header, Finished (20):
* TLSv1.3 (OUT), TLS change cipher, Change cipher spec (1):
* TLSv1.2 (OUT), TLS header, Supplemental data (23):
* TLSv1.3 (OUT), TLS handshake, Finished (20): 
```

- the meaning of --tls : --tls-max -> limit for 1.2 down (1.1, 1.0) , --tlsv -> using from 1.3 and upper 

12. Ques 8 CNI network policy -- (medium) (4/5)

- some tips could remember: NOTE: CNI removal may require a node restart to fully take effect.
 ->  `sudo systemctl restart kubelet`
 - remember: static -> create in the manifest folder, create from manifest mean use `k apply -f` or `k create -f` directly. 
 - If the question has `Support network policy` then use calico 
 - to get cidr ip -> ` k describe node | grep -i podcidr`
 - Khi Flannel Pod khởi động lên, nó so sánh CIDR trong file config với podCIDR của Node
 - 👉 (Muốn Flannel chạy, bạn phải tải file về, mở ConfigMap kube-flannel-cfg và sửa "Network": 
 - kubectl get cm -n kube-system kubeadm-config -o yaml | grep podSubnet

*** If coredns die -> it connected to these old card -> restart it after apply new cni if it die so that it could reset: ***
``kubectl rollout restart deployment coredns -n kube-system``


14. Ques 4 - Resource Allocation -- Warning: This one is a hard one. -- normal -- could be done for 5', there not hard to get the trick (4/5)
-- the easiest is go to doc e.g cpu limit -> coppy cpu + memory -> change to 100 & 150 -> then scale back the deployment. -> check deployment -> if not ok -> reduce.

- a trick from this is that you could reflect to this when come to init container for know the structure of many containers.
- Trick: 1 grep allocatable
- echo $(( <cpu/memory>/ <1024 | number of pod>)) - cpu -> 2=2000, 1=1000
- * The good way is to get cpu/memory -50% then /3* -> that the limit number -50= request number
- Don't set too low -> could be oomkilled/ crashloopbackoff/error
- this is to create a skeleton: k run testpod --image=nginx --dry-run=client -o yaml 
- we could use this also : 
`` kubectl set resources deployment wordpress --requests="cpu=150m,memory=250Mi" --limits="cpu=200m,memory=300Mi" --dry-run=client -o yaml ``
- remember cpu:m (as the memory low), memory: Mi (as the memory higher x10,x1000 for storage)
- this could be validate by get the pod, if it running 3/3 pod -> ok, if not -> cpu/memory too high
- ncl nguon 150-200 la hop ly, con viec chia deu chang qua la m set limits, requests cho resources thoi ~~ 


15. Ques 19 - resource allocation v2 --- normal also (4/5)
- no need to change the limit as the question said so, when you apply the new one, just wait 1 min for the effect take, also you could try k rollout if needed 
- as you could see from here, I set cpu = 150m, memory=200 (standard), validate by k get pods after restart rollout, it effect imidiately that pod running after 5-7sec creating without error -> so don't wait too much more than 30s in rollout
"       resources:
          limits:
            cpu: 300m
            memory: 500Mi
          requests:
            cpu: 150m (from 100m)
            memory: 200Mi "
- So the core is limit =250~300, requests=150~200 maybe 250 (no need to calculate too much)



16. Ques 2 ArgoCD - I hate this lab so bad! (must redo at least 1 times per day!) (4/5)
- 1. when you generate template, kn -> not work -> you have to set crd.installs = false (--set crds.install=false), and must have --namespace argocd as require because the template doesn't know your current context.
- 2. must remember: argo-cd (argocd/argo-cd)
- 3. If you not remember then do helm search repo argocd -> it will show a list of chart inside (show stable version as well)
- (maybe need maybe not - helm show values argocd/argo-cd)


--- maybe this would helpful: helm show values argocd/argo-cd | less -> /crd -> enter -> n -> q (-> quit)


17. Ques 9 Cri- dockered - I also hate this lab also (4/5)\
- remember the start command of cri-docker.
- For this ques you need root environment.
`` vagrant@k8s-control:~$ dpkg -i cri-dockerd.deb 
dpkg: error: requested operation requires superuser privilege ``
- remember these thing: 
    1. systemctl enable (--now) cri-docker
    2. the path to config network hard -> /etc/sysctl.d/k8s.config -> if not -> create file here
    3. sysctl --system -> restart sysctl to apply things.
- `If you don't remember, just hit "Search keyword: container runtimes, forwarding.", it will have guide to edit them in the k8s docs`

-- 2nd time I forgot the sysctl --system + /etc/sysctl.d/k8s.conf path for config port there


18. Ques 11 Gateway API - lai 1 bai xuong sau nua (4/5)

-- nho ky tls from ingress -> port la 443 nghe chua !!!

- -- just take a look from the docs + get in temp 

- use the k explain gateway.spec.listeners.tls
- if the ingress have tls -> use https or secretName -> hint of ssl/tls -> port 443
- we can get a set of api-resource:  k get gateway,httproutes
- they maybe have a reverse of this question, becareful. (create ingress from gateway?? ques 12 ? )
- oki done

19. Ques 15 ETCD Fix - (4/5)
- cau truc luon la:
- sudo systemctl status kubelet
- sudo crictl ps -a
- sudo crictl logs <containerid>

--- for etcd -> kubectl has command for that 
time consuming for this task too much, moveon!


===
Hãy dành thời gian mỗi ngày 1 lần làm lại như lúc ôn thi cấp 3 ! tích đủ 5 mark + bấm thời gian để tối ưu --- hãy nhớ về khoản thời gian đó xong rút ngắn còn 20' thôi, đấy mới là cách ôn, cách học!
===
mo codimium trong bai thi -> bat terminal trong do luon, tien loi! -> vua tao duoc cua so text de coppy, vua de chay command!, vua tra doc xong coppy vo duoc, co the mo k8s trong codium duoc luon, thay vi mo firefox, ctrl+shift+p -> codium -> "kubernetes" -> open cluster -> all done. very convenient
