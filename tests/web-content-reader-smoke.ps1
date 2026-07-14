[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repositoryRoot = Split-Path -Parent $PSScriptRoot
$packageRoot = Join-Path $repositoryRoot 'packages\web-content-reader'
$outputsRoot = Join-Path $repositoryRoot 'outputs'
$testRoot = Join-Path $outputsRoot ('web-content-reader-smoke-' + [guid]::NewGuid().ToString('N'))

function Read-Summary {
    param([object[]]$Output)

    $text = ($Output | Out-String).Trim()
    if (-not $text) {
        throw '脚本没有返回运行摘要。'
    }
    return $text | ConvertFrom-Json
}

function Assert-FailedManifest {
    param(
        [object]$Summary,
        [string]$Name
    )

    if (-not (Test-Path -LiteralPath $Summary.ManifestPath -PathType Leaf)) {
        throw "$Name 未生成manifest.json。"
    }
    $items = @(Get-Content -LiteralPath $Summary.ManifestPath -Raw -Encoding UTF8 | ConvertFrom-Json)
    if ($items.Count -ne 1) {
        throw "$Name 应生成1条结果，实际为$($items.Count)条。"
    }
    if ($items[0].Status -ne 'failed') {
        throw "$Name 关闭全部外部路径后应返回failed。"
    }
    if ([string]::IsNullOrWhiteSpace($items[0].Error)) {
        throw "$Name 失败结果必须包含可操作的诊断信息。"
    }
}

New-Item -ItemType Directory -Path $testRoot -Force | Out-Null
try {
    $workflowOutput = & (Join-Path $packageRoot 'skill\web-content-reader\scripts\batch_web_content.ps1') `
        -Urls 'https://example.invalid/article' `
        -OutputDirectory (Join-Path $testRoot 'workflow') `
        -DisableDirectExtraction `
        -DisableLocalBrowser `
        -DisableStealthFallback
    $workflowSummary = Read-Summary -Output $workflowOutput
    Assert-FailedManifest -Summary $workflowSummary -Name 'Web Content Reader'

    $mockBin = Join-Path $testRoot 'mock-bin'
    New-Item -ItemType Directory -Path $mockBin -Force | Out-Null
    @'
Start-Sleep -Seconds 30
'@ | Set-Content -LiteralPath (Join-Path $mockBin 'browser-act.ps1') -Encoding utf8
    $originalPath = $env:PATH
    try {
        $env:PATH = "$mockBin$([IO.Path]::PathSeparator)$originalPath"
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        $timeoutOutput = & (Join-Path $packageRoot 'skill\web-content-reader\scripts\batch_web_content.ps1') `
            -Urls 'https://example.invalid/hanging-stealth' `
            -OutputDirectory (Join-Path $testRoot 'workflow-timeout') `
            -DisableDirectExtraction `
            -DisableLocalBrowser `
            -StealthAttempts 1 `
            -StealthTimeoutSeconds 1
        $stopwatch.Stop()
        $timeoutSummary = Read-Summary -Output $timeoutOutput
        Assert-FailedManifest -Summary $timeoutSummary -Name 'Web Content Reader hard timeout'
        if ($stopwatch.Elapsed.TotalSeconds -gt 8) {
            throw "Web Content Reader硬超时测试耗时$([math]::Round($stopwatch.Elapsed.TotalSeconds, 2))秒，未在预期时间内返回。"
        }
        $timeoutItem = @(Get-Content -LiteralPath $timeoutSummary.ManifestPath -Raw -Encoding UTF8 | ConvertFrom-Json)[0]
        if ($timeoutItem.Error -notmatch '超过1秒，已终止') {
            throw 'Web Content Reader硬超时失败结果未记录明确的终止诊断。'
        }
    } finally {
        $env:PATH = $originalPath
    }

    $weixinOutput = & (Join-Path $packageRoot 'skill\weixin-article-reader\scripts\batch_weixin_download.ps1') `
        -Urls 'https://mp.weixin.qq.com/s/example' `
        -OutputDirectory (Join-Path $testRoot 'weixin') `
        -DisableOpenCli `
        -DisableStealthFallback
    $weixinSummary = Read-Summary -Output $weixinOutput
    Assert-FailedManifest -Summary $weixinSummary -Name 'Weixin Article Reader'

    Write-Output 'Web Content Reader smoke tests passed.'
} finally {
    $resolvedOutputs = [IO.Path]::GetFullPath($outputsRoot)
    $resolvedTest = [IO.Path]::GetFullPath($testRoot)
    if (-not $resolvedTest.StartsWith($resolvedOutputs, [StringComparison]::OrdinalIgnoreCase)) {
        throw '测试目录越界，拒绝清理。'
    }
    if (Test-Path -LiteralPath $resolvedTest) {
        Remove-Item -LiteralPath $resolvedTest -Recurse -Force
    }
}
