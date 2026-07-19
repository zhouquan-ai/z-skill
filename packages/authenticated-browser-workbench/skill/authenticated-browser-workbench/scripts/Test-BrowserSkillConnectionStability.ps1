[CmdletBinding()]
param(
    [ValidateRange(30, 3600)]
    [int]$DurationSeconds = 180,

    [ValidateRange(2, 60)]
    [int]$IntervalSeconds = 5
)

$ErrorActionPreference = 'Stop'

if (-not (Get-Command bsk -ErrorAction SilentlyContinue)) {
    throw '未找到 bsk 命令。'
}

$samples = [Collections.Generic.List[object]]::new()
$stopwatch = [Diagnostics.Stopwatch]::StartNew()

while ($stopwatch.Elapsed.TotalSeconds -lt $DurationSeconds) {
    $timestamp = Get-Date
    $raw = & bsk browsers --json 2>&1
    $exitCode = $LASTEXITCODE
    if ($exitCode -ne 0) {
        $samples.Add([pscustomobject]@{
            timestamp = $timestamp
            count = 0
            epochs = @()
            versions = @()
            error = ($raw -join "`n")
        })
    } else {
        $browsers = @($raw | ConvertFrom-Json)
        $samples.Add([pscustomobject]@{
            timestamp = $timestamp
            count = $browsers.Count
            epochs = @($browsers | ForEach-Object { $_.connected_at_ms })
            versions = @($browsers | ForEach-Object { "$($_.browser_name) $($_.browser_version) / extension $($_.extension_version)" })
            error = $null
        })
    }

    $remaining = $DurationSeconds - $stopwatch.Elapsed.TotalSeconds
    if ($remaining -gt 0) {
        Start-Sleep -Seconds ([Math]::Min($IntervalSeconds, [Math]::Ceiling($remaining)))
    }
}

$stopwatch.Stop()
$missingSamples = @($samples | Where-Object { $_.count -eq 0 }).Count
$multipleSamples = @($samples | Where-Object { $_.count -gt 1 }).Count
$epochs = @($samples | ForEach-Object { $_.epochs } | Where-Object { $_ } | Sort-Object -Unique)
$versions = @($samples | ForEach-Object { $_.versions } | Where-Object { $_ } | Sort-Object -Unique)
$errors = @($samples | Where-Object { $_.error }).Count
$passed = $missingSamples -eq 0 -and $multipleSamples -eq 0 -and $epochs.Count -eq 1 -and $errors -eq 0

[pscustomobject]@{
    passed = $passed
    duration_seconds = [Math]::Round($stopwatch.Elapsed.TotalSeconds, 1)
    sample_count = $samples.Count
    missing_samples = $missingSamples
    multiple_browser_samples = $multipleSamples
    connection_epoch_count = $epochs.Count
    command_error_samples = $errors
    observed_versions = $versions
    acceptance = '全程恰好一个浏览器在线，且 connected_at_ms 未变化'
} | ConvertTo-Json -Depth 5

if (-not $passed) {
    exit 1
}
