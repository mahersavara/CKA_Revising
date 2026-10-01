# Creates Desktop Shortcuts for CKA Lab
$CurrentDir = $PSScriptRoot
$Desktop = [Environment]::GetFolderPath("Desktop")
$WScript = New-Object -ComObject WScript.Shell

# 1. Start Lab Shortcut
$StartShortcut = $WScript.CreateShortcut("$Desktop\CKA Kubernetes Lab.lnk")
$StartShortcut.TargetPath = "$CurrentDir\start-lab.bat"
$StartShortcut.WorkingDirectory = "$CurrentDir"
$StartShortcut.IconLocation = "cmd.exe,0"
$StartShortcut.Description = "Launch and SSH into CKA Kubernetes Lab"
$StartShortcut.Save()

# 2. Stop Lab Shortcut
$StopShortcut = $WScript.CreateShortcut("$Desktop\Stop CKA Lab.lnk")
$StopShortcut.TargetPath = "$CurrentDir\stop-lab.bat"
$StopShortcut.WorkingDirectory = "$CurrentDir"
$StopShortcut.IconLocation = "shell32.dll,27"
$StopShortcut.Description = "Safely Shutdown CKA Kubernetes Lab"
$StopShortcut.Save()

Write-Host "[SUCCESS] Created 'CKA Kubernetes Lab' and 'Stop CKA Lab' shortcuts on your Desktop!" -ForegroundColor Green
