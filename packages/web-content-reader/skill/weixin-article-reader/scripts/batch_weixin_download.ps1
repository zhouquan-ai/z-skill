[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [Alias('Url')]
    [string[]]$Urls,

    [string]$OutputDirectory,

    [switch]$DownloadImages,

    [switch]$DisableOpenCli,

    [switch]$DisableStealthFallback,

    [ValidateRange(1, 20)]
    [int]$MaxItems = 20
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-ArticleMetadata {
    param([Parameter(Mandatory = $true)][string]$Path)

    $lines = Get-Content -LiteralPath $Path
    $title = ''
    $author = ''
    $publishTime = ''

    foreach ($line in $lines) {
        if (-not $title -and $line -match '^#\s+(.+)$') {
            $title = $Matches[1].Trim()
            continue
        }
        if (-not $author -and $line -match '^>\s*公众号:\s*(.+)$') {
            $author = $Matches[1].Trim()
            continue
        }
        if (-not $publishTime -and $line -match '^>\s*发布时间:\s*(.+)$') {
            $publishTime = $Matches[1].Trim()
        }
        if (-not $author -and $line -match '^\[([^\]]+)\]\(javascript:void') {
            $author = $Matches[1].Trim()
        }
        if (-not $publishTime -and $line -match '(\d{4}年\d{1,2}月\d{1,2}日\s+\d{1,2}:\d{2})') {
            $publishTime = $Matches[1]
        }
    }

    $separatorIndex = [Array]::IndexOf($lines, '---')
    $bodyLines = if ($separatorIndex -ge 0 -and $separatorIndex + 1 -lt $lines.Count) {
        $lines[($separatorIndex + 1)..($lines.Count - 1)]
    } else {
        $lines
    }
    $body = ($bodyLines -join "`n").Trim()

    [pscustomobject]@{
        Title = $title
        Author = $author
        PublishTime = $publishTime
        ContentLength = $body.Length
    }
}

function Get-SafeFileName {
    param(
        [int]$Index,
        [string]$Title
    )

    $name = if ($Title) { $Title } else { '未命名微信文章' }
    foreach ($char in [System.IO.Path]::GetInvalidFileNameChars()) {
        $name = $name.Replace([string]$char, '_')
    }
    $name = ($name -replace '\s+', ' ').Trim().TrimEnd('.')
    if ($name.Length -gt 90) {
        $name = $name.Substring(0, 90).Trim()
    }
    return ('{0:D3}-{1}.md' -f $Index, $name)
}

function Test-WeixinContent {
    param(
        [string]$Title,
        [string]$Markdown
    )

    if (-not $Title -or -not $Markdown) {
        throw '导出内容缺少标题或正文。'
    }
    $plain = ($Markdown -replace '\s+', '').Trim()
    if ($plain.Length -lt 100) {
        throw '导出正文长度低于100字符。'
    }
    $prefix = $Markdown.Substring(0, [math]::Min(1500, $Markdown.Length))
    $restrictionPattern = '环境异常|访问过于频繁|请完成验证|登录后继续|当前环境存在异常|Access Denied|Forbidden|Checking your browser|Just a moment'
    if ($prefix -match $restrictionPattern -or $Title -match $restrictionPattern) {
        throw '页面疑似访问限制、登录或验证页面。'
    }
}

$opencli = if ($DisableOpenCli) { $null } else { Get-Command opencli -ErrorAction SilentlyContinue }
$browserAct = if ($DisableStealthFallback) { $null } else { Get-Command browser-act -ErrorAction SilentlyContinue }
$normalized = [System.Collections.Generic.List[string]]::new()
$seen = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)

foreach ($rawUrl in $Urls) {
    foreach ($candidate in ($rawUrl -split '[;\r\n]+')) {
        $value = $candidate.Trim()
        if (-not $value) {
            continue
        }
        if ($seen.Add($value)) {
            $normalized.Add($value)
        }
    }
}

if ($normalized.Count -eq 0) {
    throw '未提供可读取的微信公众号文章URL。'
}
if ($normalized.Count -gt $MaxItems) {
    throw "本批共$($normalized.Count)篇，超过单批上限$MaxItems篇。请分批处理。"
}

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
if (-not $OutputDirectory) {
    $OutputDirectory = Join-Path $env:TEMP 'weixin-article-reader'
}
$runDirectory = Join-Path $OutputDirectory "run-$timestamp"
New-Item -ItemType Directory -Path $runDirectory -Force | Out-Null

$results = [System.Collections.Generic.List[object]]::new()
$index = 0

foreach ($url in $normalized) {
    $index++
    $itemDirectory = Join-Path $runDirectory ('{0:D3}' -f $index)
    New-Item -ItemType Directory -Path $itemDirectory -Force | Out-Null

    $result = [ordered]@{
        Index = $index
        Url = $url
        Status = 'failed'
        Method = ''
        Title = ''
        Author = ''
        PublishTime = ''
        ContentLength = 0
        MarkdownPath = ''
        Attempts = 0
        PrimaryAttempts = 0
        FallbackAttempts = 0
        RouteHistory = ''
        Warning = ''
        Error = ''
    }

    $routeErrors = [System.Collections.Generic.List[string]]::new()
    $routeHistory = [System.Collections.Generic.List[string]]::new()
    $uri = [uri]$url
    if ($uri.Scheme -ne 'https' -or $uri.Host -ne 'mp.weixin.qq.com' -or $uri.AbsolutePath -notlike '/s*') {
        $result.Error = '链接不是受支持的微信公众号文章URL。'
        $results.Add([pscustomobject]$result)
        continue
    }

    if ($opencli) {
        $routeHistory.Add('opencli-weixin')
        for ($attempt = 1; $attempt -le 2; $attempt++) {
            $result.Attempts++
            $result.PrimaryAttempts++
            $attemptDirectory = Join-Path $itemDirectory "opencli-attempt-$attempt"
            New-Item -ItemType Directory -Path $attemptDirectory -Force | Out-Null
            try {
                $imageValue = if ($DownloadImages) { 'true' } else { 'false' }
                $commandOutput = & $opencli.Source weixin download --url $url --output $attemptDirectory --download-images $imageValue -f yaml 2>&1 | Out-String
                if ($LASTEXITCODE -ne 0) {
                    throw "OpenCLI退出码为$LASTEXITCODE。$($commandOutput.Trim())"
                }

                $markdownFiles = @(Get-ChildItem -LiteralPath $attemptDirectory -Recurse -File -Filter '*.md')
                if ($markdownFiles.Count -ne 1) {
                    throw "期望得到1个Markdown文件，实际得到$($markdownFiles.Count)个。"
                }

                $markdown = Get-Content -LiteralPath $markdownFiles[0].FullName -Raw
                $metadata = Get-ArticleMetadata -Path $markdownFiles[0].FullName
                Test-WeixinContent -Title $metadata.Title -Markdown $markdown

                $result.Status = 'success'
                $result.Method = 'opencli-weixin'
                $result.Title = $metadata.Title
                $result.Author = $metadata.Author
                $result.PublishTime = $metadata.PublishTime
                $result.ContentLength = $metadata.ContentLength
                $result.MarkdownPath = $markdownFiles[0].FullName
                $result.Error = ''
                break
            } catch {
                $routeErrors.Add("OpenCLI第${attempt}次：$($_.Exception.Message)")
            }
        }
    } elseif ($DisableOpenCli) {
        $routeErrors.Add('OpenCLI主路径已按参数关闭。')
    } else {
        $routeErrors.Add('未找到OpenCLI。')
    }

    if ($result.Status -ne 'success' -and $browserAct) {
        $routeHistory.Add('browseract-stealth')
        for ($attempt = 1; $attempt -le 2; $attempt++) {
            $result.Attempts++
            $result.FallbackAttempts++
            try {
                $markdown = (& $browserAct.Source stealth-extract $url --content-type markdown 2>&1 | Out-String).Trim()
                if ($LASTEXITCODE -ne 0) {
                    throw "BrowserAct退出码为$LASTEXITCODE。$markdown"
                }
                $tempPath = Join-Path $itemDirectory "browseract-stealth-attempt-$attempt.md"
                $markdown | Set-Content -LiteralPath $tempPath -Encoding utf8
                $metadata = Get-ArticleMetadata -Path $tempPath
                Test-WeixinContent -Title $metadata.Title -Markdown $markdown

                $fileName = Get-SafeFileName -Index $index -Title $metadata.Title
                $markdownPath = Join-Path $itemDirectory $fileName
                Move-Item -LiteralPath $tempPath -Destination $markdownPath -Force
                $result.Status = 'success'
                $result.Method = 'browseract-stealth'
                $result.Title = $metadata.Title
                $result.Author = $metadata.Author
                $result.PublishTime = $metadata.PublishTime
                $result.ContentLength = $metadata.ContentLength
                $result.MarkdownPath = $markdownPath
                $result.Error = ''
                break
            } catch {
                $routeErrors.Add("BrowserAct隐身提取第${attempt}次：$($_.Exception.Message)")
            }
        }
    } elseif ($result.Status -ne 'success' -and -not $DisableStealthFallback) {
        $routeErrors.Add('未找到BrowserAct，无法执行隐身提取备用路径。')
    }

    if ($result.Status -eq 'success') {
        $warnings = [System.Collections.Generic.List[string]]::new()
        if (-not $result.Author) {
            $warnings.Add('未导出公众号作者。')
        }
        if (-not $result.PublishTime) {
            $warnings.Add('未导出发布时间。')
        }
        if ($result.Method -eq 'browseract-stealth') {
            $warnings.Add('OpenCLI主路径未使用或未成功，已使用BrowserAct隐身提取备用路径。')
        }
        $result.Warning = $warnings -join ' '
    } else {
        $result.Error = $routeErrors -join ' | '
    }
    $result.RouteHistory = $routeHistory -join ' -> '

    $results.Add([pscustomobject]$result)
}

$manifestPath = Join-Path $runDirectory 'manifest.json'
$results | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $manifestPath -Encoding utf8

$summary = [pscustomobject]@{
    RunDirectory = $runDirectory
    ManifestPath = $manifestPath
    Total = $results.Count
    Success = @($results | Where-Object Status -eq 'success').Count
    Failed = @($results | Where-Object Status -eq 'failed').Count
    WithWarnings = @($results | Where-Object Warning).Count
    Results = $results
}

$summary | ConvertTo-Json -Depth 6
