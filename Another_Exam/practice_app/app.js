// Application State
let currentQuestionIndex = 0;
let commandHistory = [];
let solvedQuestions = JSON.parse(localStorage.getItem('cka_solved_questions') || '[]');
let activeTab = 'cheat';
let currentContext = 'none';
let currentPrompt = 'student@controlplane:~$';
let virtualFiles = {};
let currentEditingFilename = '';

// CodeMirror and Exam Timer State
let editorInstance;
let timerInterval;
let timeRemaining = 120 * 60; // 120 minutes in seconds
let timerStarted = false;

// DOM Elements
const questionListContainer = document.getElementById('question-list-container');
const qTitle = document.getElementById('q-title');
const qDifficulty = document.getElementById('q-difficulty');
const qDesc = document.getElementById('q-desc');
const qRequirements = document.getElementById('q-requirements');
const termInput = document.getElementById('term-input');
const terminalBody = document.getElementById('terminal-body');
const terminalHistory = document.getElementById('terminal-history');
const promptSymbolEl = document.getElementById('prompt-symbol');
const verifyBtn = document.getElementById('verify-btn');
const clearBtn = document.getElementById('clear-btn');
const revealBtn = document.getElementById('reveal-btn');
const resetBtn = document.getElementById('reset-btn');
const randomBtn = document.getElementById('random-btn');
const timerText = document.getElementById('timer-text');

// Editor Modal Elements
const editorModal = document.getElementById('editor-modal');
const editorFilename = document.getElementById('editor-filename');
const editorTextarea = document.getElementById('editor-textarea');
const editorCancelBtn = document.getElementById('editor-cancel-btn');
const editorSaveBtn = document.getElementById('editor-save-btn');

const refContentContainer = document.getElementById('ref-content-container');
const progressText = document.getElementById('progress-text');
const scoreText = document.getElementById('score-text');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');
const toastIcon = document.getElementById('toast-icon');

// Initialize App
function init() {
  renderSidebar();
  loadQuestion(0);
  updateStats();
  
  // Initialize CodeMirror editor
  editorInstance = CodeMirror.fromTextArea(editorTextarea, {
    mode: "yaml",
    theme: "dracula",
    lineNumbers: true,
    tabSize: 2,
    indentWithTabs: false,
    lineWrapping: true
  });

  // Listen to :wq VIM saving inside CodeMirror
  editorInstance.on("keydown", function(cm, e) {
    if (e.key === 'Enter') {
      const lines = cm.getValue().split('\n');
      const lastLine = lines[lines.length - 1].trim();
      if (lastLine === ':wq') {
        lines.pop();
        cm.setValue(lines.join('\n'));
        saveAndCloseEditor();
        e.preventDefault();
      } else if (lastLine === ':q!') {
        lines.pop();
        cm.setValue(lines.join('\n'));
        closeEditor();
        e.preventDefault();
      }
    }
  });

  // Event Listeners
  termInput.addEventListener('keydown', handleTerminalInput);
  verifyBtn.addEventListener('click', verifyActiveQuestion);
  clearBtn.addEventListener('click', clearTerminalHistory);
  revealBtn.addEventListener('click', revealSolution);
  resetBtn.addEventListener('click', resetProgress);
  randomBtn.addEventListener('click', loadRandomQuestion);

  // Editor Event Listeners
  editorCancelBtn.addEventListener('click', closeEditor);
  editorSaveBtn.addEventListener('click', saveAndCloseEditor);
}

// Editor Control Functions
function openEditor(filename) {
  currentEditingFilename = filename;
  editorFilename.innerText = filename;
  editorInstance.setValue(virtualFiles[filename] || '');
  editorModal.classList.add('show');
  setTimeout(() => {
    editorInstance.refresh();
    editorInstance.focus();
  }, 150);
}

function closeEditor() {
  editorModal.classList.remove('show');
  termInput.focus();
}

function saveAndCloseEditor() {
  virtualFiles[currentEditingFilename] = editorInstance.getValue();
  closeEditor();
  appendOutput(`"${currentEditingFilename}" [saved]`, 'output');
}

// Start CKA Exam Countdown Timer (120 minutes)
function startTimer() {
  if (timerStarted) return;
  timerStarted = true;
  timerInterval = setInterval(() => {
    timeRemaining--;
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      timerText.innerText = "00:00";
      appendOutput("\n[TIME OUT] Hết giờ làm bài! Terminal đã bị khóa.\n", "error");
      showToast("Hết giờ làm bài!", "error");
      termInput.disabled = true;
      verifyBtn.disabled = true;
      return;
    }
    const mins = Math.floor(timeRemaining / 60);
    const secs = timeRemaining % 60;
    timerText.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, 1000);
}

// Load a random question to increase reflex
function loadRandomQuestion() {
  const total = ckaQuestions.length;
  if (total <= 1) return;
  
  let nextIdx = currentQuestionIndex;
  // Pick a random question index different from current one
  while (nextIdx === currentQuestionIndex) {
    nextIdx = Math.floor(Math.random() * total);
  }
  loadQuestion(nextIdx);
  showToast("Đã tải câu hỏi ngẫu nhiên!", "success");
}

// Render Left Panel Sidebar
function renderSidebar() {
  questionListContainer.innerHTML = '';
  ckaQuestions.forEach((q, index) => {
    const isSolved = solvedQuestions.includes(q.id);
    const item = document.createElement('div');
    item.className = `question-list-item ${index === currentQuestionIndex ? 'active' : ''}`;
    item.onclick = () => loadQuestion(index);
    
    item.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span class="question-category">${q.category}</span>
        ${isSolved ? '<span style="color: #10B981; font-weight: bold;">✓</span>' : ''}
      </div>
      <span class="question-name">${index + 1}. ${q.title}</span>
      <div class="question-meta">
        <span>Trọng số: ${q.weight}</span>
        <span class="diff">${q.difficulty}</span>
      </div>
    `;
    questionListContainer.appendChild(item);
  });
}

// Load Question Data
function loadQuestion(index) {
  currentQuestionIndex = index;
  const q = ckaQuestions[index];
  
  // Highlight active sidebar item
  const items = document.querySelectorAll('.question-list-item');
  items.forEach((item, i) => {
    if (i === index) item.classList.add('active');
    else item.classList.remove('active');
  });

  // Load question text
  qTitle.innerText = q.title;
  qDifficulty.innerText = q.difficulty;
  qDesc.innerText = q.description;
  
  // Load requirements
  qRequirements.innerHTML = '';
  q.taskRequirements.forEach(req => {
    const li = document.createElement('li');
    li.innerText = req;
    qRequirements.appendChild(li);
  });

  // Clear current terminal session for the new question
  clearTerminalHistory();

  // Reset prompt, context, and virtual files state for new question environment
  currentPrompt = 'student@controlplane:~$';
  if (promptSymbolEl) promptSymbolEl.innerText = currentPrompt;
  currentContext = 'none';
  virtualFiles = {};

  // Load tab reference content
  renderReference();
}

// Update Header Stats
function updateStats() {
  const total = ckaQuestions.length;
  const solved = solvedQuestions.length;
  progressText.innerText = `${solved}/${total}`;
  
  const percentage = Math.round((solved / total) * 100);
  scoreText.innerText = `${percentage}%`;
  
  localStorage.setItem('cka_solved_questions', JSON.stringify(solvedQuestions));
}

// Toast Feedback Notification
function showToast(msg, type = 'success') {
  toastMessage.innerText = msg;
  toastIcon.innerText = type === 'success' ? '🚀' : '⚠️';
  toast.className = `toast show ${type}`;
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

// Handle Simulated Terminal CLI Commands
function handleTerminalInput(e) {
  // Start the CKA Exam Timer on first user interaction
  startTimer();

  if (e.key === 'Tab') {
    e.preventDefault();
    handleTabAutocomplete();
    return;
  }

  if (e.key === 'Enter') {
    const rawCmd = termInput.value;
    const cmd = rawCmd.trim();
    if (!cmd) return;

    // Log the prompt command
    appendOutput(rawCmd, 'prompt');
    commandHistory.push(cmd);
    
    // Command processing simulation
    processCommand(cmd);

    // Reset input
    termInput.value = '';
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }
}

// Tab Autocomplete Simulator for CKA Reflexes
function handleTabAutocomplete() {
  const rawVal = termInput.value;
  if (!rawVal.trim()) return;
  
  const tokens = rawVal.split(/\s+/);
  const lastToken = tokens[tokens.length - 1].toLowerCase();
  
  const suggestions = {
    "po": "pods",
    "pod": "pods",
    "dep": "deployments",
    "deploy": "deployments",
    "svc": "services",
    "service": "services",
    "ns": "namespaces",
    "namespace": "namespaces",
    "no": "nodes",
    "node": "nodes",
    "sc": "storageclasses",
    "pvc": "persistentvolumeclaims",
    "pv": "persistentvolumes",
    "ingress": "ingresses",
    "netpol": "networkpolicies",
    "hpa": "horizontalpodautoscalers",
    "roll": "rollout",
    "desc": "describe",
    "cre": "create"
  };

  if (suggestions[lastToken]) {
    tokens[tokens.length - 1] = suggestions[lastToken];
    termInput.value = tokens.join(' ') + ' ';
  }
}

// Command interpreter logic simulator
function processCommand(cmd) {
  const cleanCmd = cmd.toLowerCase().replace(/\s+/g, ' ');
  
  if (cleanCmd === 'clear') {
    clearTerminalHistory();
    return;
  }
  
  if (cleanCmd === 'history') {
    commandHistory.forEach((c, idx) => {
      appendOutput(` ${idx + 1}  ${c}`);
    });
    return;
  }

  // Syntax and CLI command validation
  const tokens = cmd.trim().split(/\s+/);
  const primary = tokens[0] || '';
  
  // Intercept SSH to Node
  if (primary === 'ssh') {
    const node = tokens[1] || 'node';
    currentPrompt = `root@${node}:~#`;
    promptSymbolEl.innerText = currentPrompt;
    appendOutput(`Welcome to Ubuntu 20.04.2 LTS (GNU/Linux 5.4.0-73-generic x86_64)\n\nSystem load:  0.0               Processes:             118\nUsage of /:   12.4% of 19.56GB   Users logged in:       0\n\nLast login: Fri Jul 24 17:10:00 2026 from 10.0.0.10`, 'output');
    return;
  }

  // Intercept exit command
  if (cleanCmd === 'exit') {
    if (currentPrompt !== 'student@controlplane:~$') {
      currentPrompt = 'student@controlplane:~$';
      promptSymbolEl.innerText = currentPrompt;
      appendOutput('logout\nConnection to node closed.', 'output');
    } else {
      appendOutput('exit\nNo session to exit. Type clear to wipe terminal logs.', 'error');
    }
    return;
  }

  // Block kubectl commands when root is logged on a worker node (very realistic CKA trap)
  if (currentPrompt.startsWith('root@') && (primary === 'kubectl' || primary === 'k')) {
    appendOutput(`The connection to the server localhost:8080 was refused - did you specify the right host or port? (Are you runnning kubectl directly from a worker node?)`, 'error');
    return;
  }

  // Intercept text editor launch
  if (primary === 'vi' || primary === 'nano' || primary === 'vim') {
    const filename = tokens[1] || 'unnamed.yaml';
    openEditor(filename);
    return;
  }

  // Intercept context switching
  if (cleanCmd.startsWith('kubectl config use-context') || cleanCmd.startsWith('k config use-context')) {
    const contextName = tokens[tokens.length - 1];
    currentContext = contextName;
    appendOutput(`Switched to context "${contextName}".`, 'output');
    return;
  }

  // Handle ETCDCTL environment variables prefix
  if (cmd.startsWith('ETCDCTL_API=3')) {
    const sub = cmd.substring('ETCDCTL_API=3'.length).trim();
    const subTokens = sub.split(/\s+/);
    if (subTokens[0] !== 'etcdctl') {
      appendOutput(`bash: ${subTokens[0] || 'command'}: command not found`, 'error');
      return;
    }
  } else {
    // Normal command validation
    const allowedPrefixes = ['kubectl', 'k', 'helm', 'echo', 'cat', 'mkdir', 'alias', 'export', 'complete', 'ssh', 'sudo', 'apt-get', 'systemctl', 'crictl', 'docker', 'exit', 'cd', 'ls', 'nano', 'vi', 'vim'];
    if (!allowedPrefixes.includes(primary)) {
      appendOutput(`bash: ${primary}: command not found`, 'error');
      return;
    }

    // Subcommand validation
    if (primary === 'kubectl' || primary === 'k') {
      const sub = tokens[1];
      const validSubs = ['get', 'describe', 'create', 'run', 'delete', 'set', 'rollout', 'scale', 'patch', 'expose', 'edit', 'exec', 'logs', 'apply', 'autoscale', 'config'];
      if (!sub) {
        appendOutput(`kubectl controls the Kubernetes cluster manager.\n\nFind more information at: https://kubernetes.io/docs/reference/`, 'output');
        return;
      }
      if (!validSubs.includes(sub)) {
        appendOutput(`Error: unknown command "${sub}" for "kubectl"`, 'error');
        return;
      }
    }
  }

  // Simulate specific output structures
  if (cleanCmd.startsWith('kubectl get nodes') || cleanCmd.startsWith('k get nodes')) {
    if (cleanCmd.includes('custom-columns')) {
      appendOutput(`NAME           TAINTS\nk8s-master-0   node-role.kubernetes.io/master:NoSchedule\nk8s-node-0     <none>\nk8s-node-1     <none>`, 'output');
    } else {
      appendOutput(`NAME           STATUS   ROLES    AGE   VERSION\nk8s-master-0   Ready    master   77d   v1.20.1\nk8s-node-0     Ready    <none>   77d   v1.20.0\nk8s-node-1     Ready    <none>   77d   v1.20.0`, 'output');
    }
    return;
  }

  if (cleanCmd.startsWith('kubectl describe node') || cleanCmd.startsWith('k describe node') || cleanCmd.startsWith('kubectl describe nodes') || cleanCmd.startsWith('k describe nodes')) {
    if (cleanCmd.includes('k8s-master-0')) {
      appendOutput(`Name:               k8s-master-0\nRoles:              master\nLabels:             kubernetes.io/hostname=k8s-master-0\nTaints:             node-role.kubernetes.io/master:NoSchedule\nCreationTimestamp:  Thu, 10 May 2026 10:00:00 +0000\nConditions:\n  Type             Status  LastHeartbeatTime\n  ----             ------  -----------------\n  Ready            True    Sat, 25 Jul 2026 15:40:00 +0700`, 'output');
    } else if (cleanCmd.includes('k8s-node-0')) {
      appendOutput(`Name:               k8s-node-0\nRoles:              <none>\nLabels:             kubernetes.io/hostname=k8s-node-0\nTaints:             <none>\nCreationTimestamp:  Thu, 10 May 2026 10:00:00 +0000\nConditions:\n  Type             Status  LastHeartbeatTime\n  ----             ------  -----------------\n  Ready            True    Sat, 25 Jul 2026 15:40:00 +0700`, 'output');
    } else if (cleanCmd.includes('k8s-node-1') || cleanCmd.includes('ek8s-node-1')) {
      appendOutput(`Name:               k8s-node-1\nRoles:              <none>\nLabels:             kubernetes.io/hostname=k8s-node-1\nTaints:             <none>\nCreationTimestamp:  Thu, 10 May 2026 10:00:00 +0000\nConditions:\n  Type             Status  LastHeartbeatTime\n  ----             ------  -----------------\n  Ready            True    Sat, 25 Jul 2026 15:40:00 +0700`, 'output');
    } else {
      appendOutput(`[describe] Hiển thị taints nhanh của các Node:\n- Node k8s-master-0: Taints = node-role.kubernetes.io/master:NoSchedule\n- Node k8s-node-0: Taints = <none>\n- Node k8s-node-1: Taints = <none>`, 'output');
    }
    return;
  }
  
  if (cleanCmd.startsWith('kubectl get pods') || cleanCmd.startsWith('k get pods') || cleanCmd.startsWith('k get po') || cleanCmd.startsWith('kubectl get po')) {
    if (cleanCmd.includes('-n development') || cleanCmd.includes('--namespace=development')) {
      appendOutput(`NAME    READY   STATUS    RESTARTS   AGE\nnginx   1/1     Running   0          45s`, 'output');
    } else if (cleanCmd.includes('-n staging')) {
      appendOutput(`NAME                   READY   STATUS    RESTARTS   AGE\nnon-persistent-redis   1/1     Running   0          12s`, 'output');
    } else {
      appendOutput(`NAME           READY   STATUS    RESTARTS   AGE\nfrontend       1/1     Running   0          5m\nbar            1/1     Running   0          12m\nnginx-dev      1/1     Running   0          1m`, 'output');
    }
    return;
  }

  if (cleanCmd.startsWith('kubectl create namespace') || cleanCmd.startsWith('k create namespace') || cleanCmd.startsWith('kubectl create ns') || cleanCmd.startsWith('k create ns')) {
    const parts = cmd.split(/\s+/);
    const ns = parts[parts.length - 1];
    appendOutput(`namespace/${ns} created`, 'output');
    return;
  }

  if (cleanCmd.startsWith('kubectl run') || cleanCmd.startsWith('k run')) {
    const parts = cmd.split(/\s+/);
    const name = parts[2] || 'pod';
    appendOutput(`pod/${name} created`, 'output');
    return;
  }

  if (cleanCmd.startsWith('kubectl delete') || cleanCmd.startsWith('k delete')) {
    appendOutput(`resource deleted successfully (grace-period: 0s)`, 'output');
    return;
  }

  if (cleanCmd.startsWith('kubectl get sc') || cleanCmd.startsWith('k get sc') || cleanCmd.startsWith('kubectl get storageclass')) {
    appendOutput(`NAME                   PROVISIONER             RECLAIMPOLICY   VOLUMEBINDINGMODE      ALLOWVOLUMEEXPANSION   AGE\nlocal-path (default)   rancher.io/local-path   Delete          WaitForFirstConsumer   false                  1m`, 'output');
    return;
  }

  if (cleanCmd.startsWith('kubectl cordon') || cleanCmd.startsWith('k cordon')) {
    const parts = cmd.split(/\s+/);
    const node = parts[parts.length - 1];
    appendOutput(`node/${node} cordoned`, 'output');
    return;
  }

  if (cleanCmd.startsWith('kubectl drain') || cleanCmd.startsWith('k drain')) {
    const parts = cmd.split(/\s+/);
    const node = parts[2] || 'node';
    appendOutput(`evicting pod default/frontend...\nevicting pod default/bar...\nnode/${node} drained`, 'output');
    return;
  }

  // Fallback default response
  appendOutput(`Command run successfully in simulation env.`, 'output');
}

// Append logs/output to the screen
function appendOutput(text, type = '') {
  const div = document.createElement('div');
  div.className = 'output-line';
  if (type === 'prompt') {
    div.innerHTML = `<span class="prompt-symbol">${currentPrompt}</span> ${text}`;
  } else if (type === 'output') {
    div.style.color = '#34D399'; // Green output
    div.innerText = text;
  } else if (type === 'error') {
    div.style.color = '#F87171'; // Red error
    div.innerText = text;
  } else {
    div.innerText = text;
  }
  terminalHistory.appendChild(div);
}

// Verify Active Question Solution
function verifyActiveQuestion() {
  const q = ckaQuestions[currentQuestionIndex];
  
  // Validate Context Switching First (Must switch to question's context)
  const targetContext = q.context || 'k8s';
  if (currentContext !== targetContext) {
    appendOutput(`\n[ERROR] Kiểm tra thất bại: Bạn chưa chuyển ngữ cảnh sang đúng context của câu hỏi: "${targetContext}"`, 'error');
    appendOutput(`➔ Vui lòng chạy lệnh: kubectl config use-context ${targetContext}\n`, 'error');
    showToast(`Sai context! Yêu cầu: ${targetContext}`, 'error');
    terminalBody.scrollTop = terminalBody.scrollHeight;
    return;
  }
  
  const result = q.validate(commandHistory, virtualFiles);
  
  if (result.success) {
    appendOutput(`\n[SUCCESS] Chúc mừng! Bạn đã hoàn thành câu hỏi này.\n`, 'output');
    showToast(result.msg, 'success');
    
    if (!solvedQuestions.includes(q.id)) {
      solvedQuestions.push(q.id);
      updateStats();
      renderSidebar();
    }
  } else {
    appendOutput(`\n[ERROR] Kiểm tra thất bại: ${result.msg}\n`, 'error');
    showToast(result.msg, 'error');
  }
  terminalBody.scrollTop = terminalBody.scrollHeight;
}

// Clear CLI Screen
function clearTerminalHistory() {
  terminalHistory.innerHTML = '';
  commandHistory = [];
}

// Reveal Answer Solution to Terminal
function revealSolution() {
  const q = ckaQuestions[currentQuestionIndex];
  appendOutput(`\n[SOLUTION - PHÂN TÍCH CÚ PHÁP LƯU MUSCLE MEMORY]`, 'output');
  
  if (q.breakdown) {
    q.breakdown.forEach((item, index) => {
      appendOutput(`\n👉 Lệnh ${index + 1}: ${item.cmd}`, 'output');
      item.explain.forEach(exp => {
        appendOutput(`   • ${exp}`);
      });
    });
  } else {
    q.sampleAnswers.forEach(ans => {
      appendOutput(`> ${ans}`, 'output');
    });
  }
  terminalBody.scrollTop = terminalBody.scrollHeight;
}

// Reset Score Progress
function resetProgress() {
  if (confirm("Bạn có chắc chắn muốn xóa hết tiến độ và làm lại từ đầu?")) {
    solvedQuestions = [];
    updateStats();
    renderSidebar();
    
    // Reset Exam Timer state
    clearInterval(timerInterval);
    timeRemaining = 120 * 60;
    timerStarted = false;
    timerText.innerText = "120:00";
    termInput.disabled = false;
    verifyBtn.disabled = false;

    loadQuestion(0);
    showToast("Đã reset toàn bộ tiến trình luyện tập!", "success");
  }
}

// Tab Switcher
function switchTab(tab) {
  activeTab = tab;
  document.getElementById('tab-cheat').className = `ref-tab ${tab === 'cheat' ? 'active' : ''}`;
  document.getElementById('tab-trap').className = `ref-tab ${tab === 'trap' ? 'active' : ''}`;
  document.getElementById('tab-pwk').className = `ref-tab ${tab === 'pwk' ? 'active' : ''}`;
  renderReference();
}

// Render Cheatsheet / Trap references dynamically based on question topic
function renderReference() {
  const q = ckaQuestions[currentQuestionIndex];
  refContentContainer.innerHTML = '';
  
  if (activeTab === 'cheat') {
    let cheatsheetHTML = '';
    switch (q.category) {
      case "Node Management":
        cheatsheetHTML = `
          <div class="ref-section">
            <h3>Lệnh kiểm tra Node</h3>
            <code>kubectl get nodes
kubectl describe node &lt;node-name&gt;</code>
          </div>
          <div class="ref-section">
            <h3>Lấy Taint của Node nhanh</h3>
            <code>kubectl get nodes -o custom-columns=NAME:.metadata.name,TAINTS:.spec.taints</code>
          </div>
        `;
        break;
      case "Pod & Namespace":
        cheatsheetHTML = `
          <div class="ref-section">
            <h3>Quản lý Namespace</h3>
            <code>kubectl create namespace &lt;tên-ns&gt;
kubectl get ns</code>
          </div>
          <div class="ref-section">
            <h3>Khởi chạy Pod</h3>
            <code>kubectl run nginx --image=nginx --restart=Never -n &lt;namespace&gt;
kubectl run busybox --image=busybox --restart=Never -- sleep 3600</code>
          </div>
        `;
        break;
      case "JsonPath & Custom Columns":
        cheatsheetHTML = `
          <div class="ref-section">
            <h3>Custom Columns (Định dạng cột)</h3>
            <code>kubectl get pods -o=custom-columns="POD_NAME:.metadata.name,STATUS:.status.phase"</code>
          </div>
          <div class="ref-section">
            <h3>JsonPath Lọc IP & Image</h3>
            <code>kubectl get pod &lt;tên-pod&gt; -o jsonpath='{.status.podIP}'
kubectl get pod &lt;tên-pod&gt; -o jsonpath='{.spec.containers[0].image}'</code>
          </div>
          <div class="ref-section">
            <h3>Sắp xếp tài nguyên</h3>
            <code>kubectl get pods --sort-by=.metadata.name
kubectl get pods --sort-by=.metadata.creationTimestamp</code>
          </div>
        `;
        break;
      case "RBAC":
        cheatsheetHTML = `
          <div class="ref-section">
            <h3>Khai báo RBAC nhanh</h3>
            <code>kubectl create clusterrole deployment-clusterrole --verb=create --resource=deployments,statefulsets,daemonsets
kubectl create serviceaccount cicd-token -n app-team1</code>
          </div>
          <div class="ref-section">
            <h3>Liên kết Namespace (RoleBinding)</h3>
            <code>kubectl create rolebinding &lt;tên-binding&gt; --clusterrole=deployment-clusterrole --serviceaccount=app-team1:cicd-token -n app-team1</code>
          </div>
        `;
        break;
      case "Logging & sidecar":
        cheatsheetHTML = `
          <div class="ref-section">
            <h3>Grep Lọc Log</h3>
            <code>kubectl logs &lt;pod-name&gt; | grep -i "từ-khóa" &gt; /đường-dẫn-file</code>
          </div>
          <div class="ref-section">
            <h3>Stream Log qua Sidecar</h3>
            <code># Thêm container phụ chạy lệnh:
tail -n+1 -f /đường-dẫn-file-log</code>
          </div>
        `;
        break;
      case "Network Policies":
        cheatsheetHTML = `
          <div class="ref-section">
            <h3>Mẫu NetworkPolicy</h3>
            <code>apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          kubernetes.io/metadata.name: source-ns</code>
          </div>
        `;
        break;
      case "Node Maintenance":
        cheatsheetHTML = `
          <div class="ref-section">
            <h3>Bảo trì Node</h3>
            <code>kubectl cordon &lt;node-name&gt;
kubectl drain &lt;node-name&gt; --delete-emptydir-data --ignore-daemonsets --force</code>
          </div>
        `;
        break;
      case "Etcd Backup & Restore":
        cheatsheetHTML = `
          <div class="ref-section">
            <h3>Backup ETCD</h3>
            <code>ETCDCTL_API=3 etcdctl --endpoints=... --cacert=... --cert=... --key=... snapshot save &lt;đường-dẫn-file&gt;</code>
          </div>
          <div class="ref-section">
            <h3>Restore ETCD</h3>
            <code>ETCDCTL_API=3 etcdctl --data-dir=&lt;thư-mục-mới&gt; snapshot restore &lt;file-backup&gt;</code>
          </div>
        `;
        break;
      case "Deployment & Scaling":
        cheatsheetHTML = `
          <div class="ref-section">
            <h3>Cập nhật & Rollback</h3>
            <code>kubectl set image deploy/&lt;tên&gt; &lt;container&gt;=&lt;image&gt; --record
kubectl rollout history deploy/&lt;tên&gt;
kubectl rollout undo deploy/&lt;tên&gt;</code>
          </div>
        `;
        break;
      default:
        cheatsheetHTML = `<p>Tra cứu cheatsheet chung cho các lệnh kubectl create, run, edit, get, delete.</p>`;
    }
    refContentContainer.innerHTML = cheatsheetHTML;
  } else {
    // Render TRAPS tab
    let trapsHTML = '';
    switch (q.category) {
      case "Node Management":
        trapsHTML = `
          <div class="trap-card">
            <strong>⚠️ Lỗi đếm nhầm Master Node</strong>
            Mặc định các cụm control-plane sẽ bị gán taint NoSchedule để Pod nghiệp vụ không tự ý lập lịch lên. Hãy kiểm tra kỹ xem đề bài yêu cầu đếm "Ready Schedulable Nodes" hay "Ready Worker Nodes" để loại trừ đúng.
          </div>
        `;
        break;
      case "Pod & Namespace":
        trapsHTML = `
          <div class="trap-card">
            <strong>⚠️ Quên chỉ định Namespace</strong>
            Hơn 80% trường hợp mất điểm là do gõ thiếu cờ -n phát triển hoặc deploy nhầm vào namespace default. Hãy tạo namespace trước, sau đó chạy lệnh chỉ định namespace rõ ràng.
          </div>
        `;
        break;
      case "RBAC":
        trapsHTML = `
          <div class="trap-card">
            <strong>⚠️ Nhầm lẫn RoleBinding vs ClusterRoleBinding</strong>
            Nếu đề bài ghi "phân quyền cho ServiceAccount giới hạn trong namespace X", bạn BẮT BUỘC phải dùng RoleBinding. Việc dùng ClusterRoleBinding sẽ khiến ServiceAccount có quyền trên toàn bộ cụm và bài thi bị tính 0 điểm.
          </div>
          <div class="trap-card" style="margin-top: 0.5rem;">
            <strong>⚠️ Khai báo sai namespace của ServiceAccount</strong>
            Khi liên kết bằng câu lệnh, hãy viết --serviceaccount=namespace-của-sa:tên-sa. Đề thi SurePass có lỗi viết default:sa, đi thi thực tế gõ thế sẽ bị sai hoàn toàn.
          </div>
        `;
        break;
      case "Node Maintenance":
        trapsHTML = `
          <div class="trap-card">
            <strong>⚠️ Lệnh Drain bị kẹt/lỗi</strong>
            Kubelet sẽ từ chối drain nếu có Pod chạy DaemonSet hoặc Pod dùng emptyDir. Bạn bắt buộc phải gõ đầy đủ các cờ --ignore-daemonsets --delete-emptydir-data --force để cưỡng chế trục xuất thành công.
          </div>
        `;
        break;
      case "Etcd Backup & Restore":
        trapsHTML = `
          <div class="trap-card">
            <strong>⚠️ Quên set API phiên bản 3</strong>
            Lệnh etcdctl mặc định chạy v2. Bạn phải gắn 'ETCDCTL_API=3' ở đầu hoặc export biến môi trường này để chạy được lệnh snapshot.
          </div>
        `;
        break;
      case "Deployment & Scaling":
        trapsHTML = `
          <div class="trap-card">
            <strong>⚠️ Sửa nhãn Labels của Pod Template</strong>
            Khi sửa đổi labels của Deployment, hãy nhớ đồng bộ nhãn ở 3 vị trí: metadata.labels, spec.selector.matchLabels và spec.template.metadata.labels để tránh làm sập luồng rollout.
          </div>
        `;
        break;
      default:
        trapsHTML = `
          <div class="trap-card">
            <strong>⚠️ Đọc kỹ đề bài!</strong>
            Hãy kiểm tra kỹ từng ký tự tên của Pod, Container, Service và các cổng kết nối. Sai một dấu gạch ngang (-) cũng có thể làm bạn mất toàn bộ điểm câu đó.
          </div>
        `;
    }
    refContentContainer.innerHTML = trapsHTML;
  } else if (activeTab === 'pwk') {
    refContentContainer.innerHTML = `
      <div class="ref-section">
        <h3>1. Khởi tạo Master Node (kubeadm init)</h3>
        <p style="color: var(--text-secondary); margin-bottom: 0.5rem;">Khởi tạo control plane trên master node:</p>
        <code>kubeadm init --apiserver-advertise-address $(hostname -i) --pod-network-cidr 10.5.0.0/16</code>
      </div>
      <div class="ref-section">
        <h3>2. Cấu hình Kubeconfig</h3>
        <p style="color: var(--text-secondary); margin-bottom: 0.5rem;">Cấp quyền truy cập kubectl cho user thường:</p>
        <code>mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config</code>
      </div>
      <div class="ref-section">
        <h3>3. Cài đặt CNI Network (Calico/Weave)</h3>
        <p style="color: var(--text-secondary); margin-bottom: 0.5rem;">Cài đặt Calico làm giao tiếp mạng giữa các Pod:</p>
        <code>kubectl apply -f https://raw.githubusercontent.com/projectcalico/calico/v3.25.0/manifests/calico.yaml</code>
      </div>
      <div class="ref-section">
        <h3>4. Join Worker Node vào cụm</h3>
        <p style="color: var(--text-secondary); margin-bottom: 0.5rem;">Lấy lệnh join kèm token trên master node:</p>
        <code>kubeadm token create --print-join-command</code>
        <p style="color: var(--text-secondary); margin-bottom: 0.5rem;">Chạy lệnh join đó trên các worker node (sau khi SSH qua):</p>
        <code>kubeadm join &lt;master-ip&gt;:6443 --token &lt;token&gt; --discovery-token-ca-cert-hash sha256:&lt;hash&gt;</code>
      </div>
      <div class="ref-section">
        <h3>5. Thực hành Deploy Dockercoins App</h3>
        <p style="color: var(--text-secondary); margin-bottom: 0.5rem;">Chạy thử ứng dụng mẫu từ workshop PWK:</p>
        <code>kubectl apply -f https://raw.githubusercontent.com/play-with-docker/play-with-kubernetes.github.io/master/posts/assets/dockercoins.yaml</code>
      </div>
    `;
  }
}

// Start Application on Load
window.onload = init;
