# Auto-updates ~/.ssh/config and syncs node IPs across the cluster
$SSHDir = "$HOME\.ssh"
if (-not (Test-Path $SSHDir)) {
    New-Item -ItemType Directory -Path $SSHDir -Force | Out-Null
}
$SSHConfigPath = "$SSHDir\config"

# 1. Try querying directly from Hyper-V
$MasterIP = (Get-VM "k8s-control" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty NetworkAdapters | Select-Object -ExpandProperty IPAddresses | Where-Object { $_ -match '^\d+\.\d+\.\d+\.\d+$' } | Select-Object -First 1)
$WorkerIP = (Get-VM "k8s-worker1" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty NetworkAdapters | Select-Object -ExpandProperty IPAddresses | Where-Object { $_ -match '^\d+\.\d+\.\d+\.\d+$' } | Select-Object -First 1)

# 2. Fallback: Parse ARP table if not elevated
if (-not $MasterIP -or -not $WorkerIP) {
    $ArpIPs = (arp -a | Select-String "172\." | ForEach-Object { ($_ -split '\s+')[1] } | Where-Object { $_ -notmatch '\.1$' -and $_ -notmatch '\.255$' })
    if ($ArpIPs.Count -ge 2) {
        $MasterIP = $ArpIPs[1]
        $WorkerIP = $ArpIPs[0]
    } elseif ($ArpIPs.Count -eq 1) {
        $MasterIP = $ArpIPs[0]
    }
}

$KeyMaster = "$PSScriptRoot\.vagrant\machines\master\hyperv\private_key" -replace '\\', '/'
$KeyWorker = "$PSScriptRoot\.vagrant\machines\worker1\hyperv\private_key" -replace '\\', '/'

# 3. Sync hostname resolution & kubelet to worker node
if ($MasterIP -and $WorkerIP -and (Test-Path $KeyWorker)) {
    try {
        $sshOpt = "-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=3"
        # Update worker hosts & kubelet endpoint
        ssh -i "$KeyWorker" $sshOpt vagrant@$WorkerIP "sudo sed -i '/k8s-control/d' /etc/hosts; echo '$MasterIP k8s-control' | sudo tee -a /etc/hosts; sudo sed -i 's/server: https:\/\/.*/server: https:\/\/k8s-control:6443/g' /etc/kubernetes/kubelet.conf; echo 'KUBELET_EXTRA_ARGS=--node-ip=$WorkerIP' | sudo tee /etc/default/kubelet; sudo systemctl daemon-reload; sudo systemctl restart kubelet" 2>$null
        # Update master kubelet
        ssh -i "$KeyMaster" $sshOpt vagrant@$MasterIP "echo 'KUBELET_EXTRA_ARGS=--node-ip=$MasterIP' | sudo tee /etc/default/kubelet; sudo systemctl daemon-reload; sudo systemctl restart kubelet" 2>$null
    } catch {}
}

$ConfigContent = @"
# --- CKA LAB AUTO-CONFIG (DO NOT EDIT MANUALLY) ---
Host cka-master
    HostName $MasterIP
    User vagrant
    IdentityFile $KeyMaster
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null

Host cka-worker
    HostName $WorkerIP
    User vagrant
    IdentityFile $KeyWorker
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
# --- END CKA LAB AUTO-CONFIG ---
"@

# Update ~/.ssh/config
if (Test-Path $SSHConfigPath) {
    $OldContent = Get-Content $SSHConfigPath -Raw
    if ($OldContent -match '(?s)# --- CKA LAB AUTO-CONFIG.*?# --- END CKA LAB AUTO-CONFIG ---') {
        $NewContent = $OldContent -replace '(?s)# --- CKA LAB AUTO-CONFIG.*?# --- END CKA LAB AUTO-CONFIG ---', $ConfigContent.Trim()
        Set-Content -Path $SSHConfigPath -Value $NewContent -Force
    } else {
        Add-Content -Path $SSHConfigPath -Value "`n$ConfigContent" -Force
    }
} else {
    Set-Content -Path $SSHConfigPath -Value $ConfigContent -Force
}

Write-Host "[OK] Synced cluster & ~/.ssh/config: cka-master -> $MasterIP | cka-worker -> $WorkerIP" -ForegroundColor Green
