# Compare every published file in this folder with what the live site serves.
# Usage: .\check.ps1   (exit code 0 = identical, 1 = differences/missing)
# Text files are compared ignoring CRLF/LF so git line-ending changes don't count.
param([string]$Url = "https://danny3929.github.io/plc-learn")
Set-Location $PSScriptRoot
$textExt = ".html", ".js", ".css", ".json", ".md", ".ps1"
$bust = Get-Random
$bad = 0; $n = 0

function Get-Hash([byte[]]$bytes, [string]$ext) {
  if ($textExt -contains $ext) {
    $s = [Text.Encoding]::UTF8.GetString($bytes) -replace "`r`n", "`n"
    $bytes = [Text.Encoding]::UTF8.GetBytes($s)
  }
  $sha = [Security.Cryptography.SHA256]::Create()
  [BitConverter]::ToString($sha.ComputeHash($bytes))
}

# Published files = what git tracks, plus any not-yet-committed allowed files.
$files = @(git ls-files) + @(git ls-files --others --exclude-standard) | Where-Object { $_ -and $_ -ne ".gitignore" } | Sort-Object -Unique
foreach ($f in $files) {
  $n++
  $ext = [IO.Path]::GetExtension($f).ToLower()
  $local = Get-Hash ([IO.File]::ReadAllBytes((Join-Path $PSScriptRoot $f))) $ext
  try {
    $r = Invoke-WebRequest "$Url/$f`?c=$bust" -UseBasicParsing -TimeoutSec 20
    $ms = New-Object IO.MemoryStream; $r.RawContentStream.CopyTo($ms)
    $live = Get-Hash $ms.ToArray() $ext
    if ($live -eq $local) { "  same     $f" } else { "  DIFFERS  $f"; $bad++ }
  } catch {
    "  MISSING  $f  (not on the live site)"; $bad++
  }
}
if ($bad) { "$bad of $n file(s) differ from the live site."; exit 1 }
"All $n published files match the live site."
