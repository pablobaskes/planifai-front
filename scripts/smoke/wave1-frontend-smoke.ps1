[CmdletBinding()]
param(
  [switch]$SkipBuild,
  [switch]$SkipTests
)

$ErrorActionPreference = 'Stop'

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot '..\..')
Set-Location $RepoRoot

function Invoke-SmokeStep {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Name,

    [Parameter(Mandatory = $true)]
    [scriptblock]$Command
  )

  Write-Host "==> $Name"
  & $Command

  if ($LASTEXITCODE -ne 0) {
    throw "$Name failed with exit code $LASTEXITCODE"
  }
}

Write-Host "Wave 1 frontend smoke"
Write-Host "Repo: $RepoRoot"

if (-not $SkipBuild) {
  Invoke-SmokeStep -Name 'npm.cmd run build' -Command { npm.cmd run build }
}

if (-not $SkipTests) {
  Invoke-SmokeStep -Name 'npm.cmd test -- --watch=false' -Command { npm.cmd test -- --watch=false }
}

Write-Host 'Wave 1 frontend smoke passed.'
