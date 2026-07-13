[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [Alias('Url')]
    [string[]]$Urls,

    [string]$OutputDirectory,

    [string]$BrowserName = $env:BROWSERACT_BROWSER_NAME,

    [switch]$DisableDirectExtraction,

    [switch]$DisableLocalBrowser,

    [switch]$DisableStealthFallback,

    [ValidateRange(1, 5)]
    [int]$StealthAttempts = 3,

    [ValidateRange(1, 20)]
    [int]$MaxItems = 20,

    [ValidateRange(50, 5000)]
    [int]$MinContentLength = 100
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-NormalizedUrls {
    param([string[]]$Values)

    $items = [System.Collections.Generic.List[object]]::new()
    $seen = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
    foreach ($raw in $Values) {
        foreach ($candidate in ($raw -split '[;\r\n]+')) {
            $value = $candidate.Trim()
            if (-not $value -or -not $seen.Add($value)) {
                continue
            }
            try {
                $uri = [uri]$value
            } catch {
                throw "无法识别URL：$value"
            }
            if ($uri.Scheme -notin @('http', 'https')) {
                throw "只支持HTTP或HTTPS网页：$value"
            }
            $items.Add([pscustomobject]@{
                Index = $items.Count + 1
                Url = $value
                IsWeixin = ($uri.Host -eq 'mp.weixin.qq.com' -and $uri.AbsolutePath -like '/s*')
            })
        }
    }
    return $items
}

function Get-SafeFileName {
    param(
        [int]$Index,
        [string]$Title
    )

    $name = if ($Title) { $Title } else { '未命名网页' }
    foreach ($char in [System.IO.Path]::GetInvalidFileNameChars()) {
        $name = $name.Replace([string]$char, '_')
    }
    $name = ($name -replace '\s+', ' ').Trim().TrimEnd('.')
    if ($name.Length -gt 90) {
        $name = $name.Substring(0, 90).Trim()
    }
    return ('{0:D3}-{1}.md' -f $Index, $name)
}

function Test-ExtractedContent {
    param(
        [string]$Title,
        [string]$Markdown,
        [int]$MinimumLength
    )

    $warnings = [System.Collections.Generic.List[string]]::new()
    if (-not $Title) {
        $warnings.Add('未提取到网页标题。')
    }
    $plain = ($Markdown -replace '\s+', '').Trim()
    if ($plain.Length -lt $MinimumLength) {
        return [pscustomobject]@{ IsValid = $false; Warning = ($warnings -join ' '); Error = "正文长度低于${MinimumLength}字符。" }
    }
    if ($plain.Length -lt 200) {
        $warnings.Add('正文较短，建议人工确认页面是否完整。')
    }
    $restrictionPattern = '环境异常|访问过于频繁|请完成验证|登录后继续|当前环境存在异常|Access Denied|Forbidden|Checking your browser|Just a moment'
    $prefix = $Markdown.Substring(0, [math]::Min(1500, $Markdown.Length))
    if ($prefix -match $restrictionPattern -or $Title -match $restrictionPattern) {
        return [pscustomobject]@{ IsValid = $false; Warning = ($warnings -join ' '); Error = '页面疑似访问限制、登录或验证页面。' }
    }
    return [pscustomobject]@{ IsValid = $true; Warning = ($warnings -join ' '); Error = '' }
}

function Get-ContentMetrics {
    param([string]$Markdown)

    $lines = @($Markdown -split "`r?`n")
    $nonEmptyLines = @($lines | Where-Object { $_.Trim() })
    $linkMatches = [regex]::Matches($Markdown, '\[[^\]]*\]\([^)]+\)')
    $imageMatches = [regex]::Matches($Markdown, '!\[[^\]]*\]\([^)]+\)')
    $linkLines = @($nonEmptyLines | Where-Object { $_ -match '\[[^\]]*\]\([^)]+\)' })
    $linkLineRatio = if ($nonEmptyLines.Count -gt 0) { [math]::Round($linkLines.Count / $nonEmptyLines.Count, 3) } else { 0 }
    $possibleNavigationNoise = (($linkMatches.Count -ge 20 -and $linkLineRatio -ge 0.35) -or ($linkMatches.Count -ge 100 -and $linkLineRatio -ge 0.2))

    [pscustomobject]@{
        LineCount = $lines.Count
        LinkCount = $linkMatches.Count
        ImageCount = $imageMatches.Count
        LinkLineRatio = $linkLineRatio
        PossibleNavigationNoise = $possibleNavigationNoise
    }
}

function Get-MarkdownHeading {
    param([string]$Markdown)

    foreach ($line in ($Markdown -split "`r?`n")) {
        if ($line -match '^#\s+(.+)$') {
            $heading = $Matches[1].Trim()
            if ($heading -match '^\[([^\]]+)\]\([^)]+\)$') {
                return $Matches[1].Trim()
            }
            return $heading
        }
    }
    return ''
}

function Get-TrafilaturaRuntime {
    param([string]$ExtractorPath)

    if (-not (Test-Path -LiteralPath $ExtractorPath)) {
        return $null
    }
    $uv = Get-Command uv -ErrorAction SilentlyContinue
    if (-not $uv) {
        return $null
    }
    $toolDirectory = (& $uv.Source tool dir | Out-String).Trim()
    $pythonPath = Join-Path $toolDirectory 'trafilatura\Scripts\python.exe'
    if (-not (Test-Path -LiteralPath $pythonPath)) {
        return $null
    }
    return [pscustomobject]@{
        PythonPath = $pythonPath
        ExtractorPath = $ExtractorPath
    }
}

function Invoke-TrafilaturaExtraction {
    param(
        [Parameter(Mandatory = $true)]$Runtime,
        [Parameter(Mandatory = $true)][string]$Url
    )

    $json = (& $Runtime.PythonPath -X utf8 $Runtime.ExtractorPath $Url 2>&1 | Out-String).Trim()
    $exitCode = $LASTEXITCODE
    if (-not $json) {
        throw 'Trafilatura未返回内容。'
    }
    try {
        $payload = $json | ConvertFrom-Json
    } catch {
        throw 'Trafilatura返回内容无法解析。'
    }
    $errorProperty = $payload.PSObject.Properties['error']
    $errorMessage = if ($errorProperty) { [string]$errorProperty.Value } else { '' }
    if ($exitCode -ne 0 -or $errorMessage) {
        $message = if ($errorMessage) { $errorMessage } else { "退出码为$exitCode。" }
        throw "Trafilatura提取失败：$message"
    }
    [pscustomobject]@{
        Title = [string]$payload.title
        Author = [string]$payload.author
        PublishTime = [string]$payload.date
        Markdown = [string]$payload.markdown
    }
}

function Invoke-StealthExtraction {
    param(
        [Parameter(Mandatory = $true)][string]$BrowserActPath,
        [Parameter(Mandatory = $true)][string]$Url,
        $DirectRuntime
    )

    if ($DirectRuntime) {
        $html = (& $BrowserActPath stealth-extract $Url --content-type html 2>&1 | Out-String).Trim()
        if ($LASTEXITCODE -ne 0) {
            throw "BrowserAct隐身提取失败：$html"
        }
        $json = ($html | & $DirectRuntime.PythonPath -X utf8 $DirectRuntime.ExtractorPath $Url --stdin-html 2>&1 | Out-String).Trim()
        $exitCode = $LASTEXITCODE
        try {
            $payload = $json | ConvertFrom-Json
        } catch {
            throw 'BrowserAct渲染结果无法完成正文清洗。'
        }
        $errorProperty = $payload.PSObject.Properties['error']
        $errorMessage = if ($errorProperty) { [string]$errorProperty.Value } else { '' }
        if ($exitCode -ne 0 -or $errorMessage) {
            $message = if ($errorMessage) { $errorMessage } else { "退出码为$exitCode。" }
            throw "BrowserAct渲染结果正文清洗失败：$message"
        }
        return [pscustomobject]@{
            Title = [string]$payload.title
            Markdown = [string]$payload.markdown
            ContentScope = 'article:stealth+trafilatura'
        }
    }

    $markdown = (& $BrowserActPath stealth-extract $Url --content-type markdown 2>&1 | Out-String).Trim()
    if ($LASTEXITCODE -ne 0) {
        throw "BrowserAct隐身提取失败：$markdown"
    }
    [pscustomobject]@{
        Title = Get-MarkdownHeading -Markdown $markdown
        Markdown = $markdown
        ContentScope = 'full-page:stealth'
    }
}

function Get-BrowserId {
    param(
        [string]$BrowserActPath,
        [string]$Name
    )

    $list = & $BrowserActPath browser list 2>&1 | Out-String
    if ($LASTEXITCODE -ne 0) {
        throw "无法读取BrowserAct浏览器列表：$($list.Trim())"
    }
    foreach ($line in ($list -split "`r?`n")) {
        if ($line -match '^id=(\S+)\s+name="([^"]+)"' -and $Matches[2] -eq $Name) {
            return $Matches[1]
        }
    }
    throw ('未找到BrowserAct浏览器：' + $Name)
}

function Get-SemanticMarkdown {
    param(
        [string]$BrowserActPath,
        [string]$Session,
        [string]$PythonPath,
        [string]$ConverterPath
    )

    $javascript = @'
(()=>{
  const selectors=[".markdown-body","article","main","[role=main]"];
  let root=null;
  let selector="body";
  for(const current of selectors){
    const candidate=document.querySelector(current);
    if(candidate && candidate.innerText && candidate.innerText.trim().length>=100){
      root=candidate;
      selector=current;
      break;
    }
  }
  if(!root){root=document.body;}
  const clone=root.cloneNode(true);
  clone.querySelectorAll("script,style,noscript,nav,header,footer,aside,form,button,[role=navigation],[aria-label*=breadcrumb i]").forEach(node=>node.remove());
  const heading=clone.querySelector("h1");
  return JSON.stringify({selector:selector,heading:heading?heading.innerText.trim():"",html:clone.innerHTML});
})()
'@
    $json = (& $BrowserActPath --session $Session eval $javascript 2>&1 | Out-String).Trim()
    if ($LASTEXITCODE -ne 0 -or -not $json) {
        throw '无法取得网页正文容器。'
    }
    $payload = $json | ConvertFrom-Json
    if (-not $payload.html) {
        throw '网页正文容器为空。'
    }
    $converted = ($payload.html | & $PythonPath -X utf8 $ConverterPath 2>&1 | Out-String).Trim()
    if ($LASTEXITCODE -ne 0 -or -not $converted) {
        throw '正文HTML转换Markdown失败。'
    }
    [pscustomobject]@{
        Selector = $payload.selector
        Heading = $payload.heading
        Markdown = $converted
    }
}

$items = @(Get-NormalizedUrls -Values $Urls)
if ($items.Count -eq 0) {
    throw '未提供可读取的网页URL。'
}
if ($items.Count -gt $MaxItems) {
    throw "本批共$($items.Count)篇，超过单批上限$MaxItems篇。请分批处理。"
}

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss-fff'
$runSuffix = [guid]::NewGuid().ToString('N').Substring(0, 6)
if (-not $OutputDirectory) {
    $OutputDirectory = Join-Path $env:TEMP 'web-content-reader'
}
$runDirectory = Join-Path $OutputDirectory "run-$timestamp-$runSuffix"
New-Item -ItemType Directory -Path $runDirectory -Force | Out-Null

$results = [System.Collections.Generic.List[object]]::new()
$weixinItems = @($items | Where-Object IsWeixin)
$genericItems = @($items | Where-Object { -not $_.IsWeixin })

if ($weixinItems.Count -gt 0) {
    $weixinScript = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..\weixin-article-reader\scripts\batch_weixin_download.ps1'))
    if (-not (Test-Path -LiteralPath $weixinScript)) {
        throw "未找到微信公众号读取脚本：$weixinScript"
    }
    $weixinOutput = Join-Path $runDirectory 'weixin-source'
    $weixinSummaryText = & $weixinScript -Urls @($weixinItems.Url) -OutputDirectory $weixinOutput | Out-String
    $weixinSummary = $weixinSummaryText | ConvertFrom-Json

    foreach ($item in $weixinItems) {
        $source = @($weixinSummary.Results | Where-Object Url -eq $item.Url)[0]
        $status = $source.Status
        $warning = $source.Warning
        $error = $source.Error
        if ($status -eq 'success') {
            $markdown = Get-Content -LiteralPath $source.MarkdownPath -Raw
            $check = Test-ExtractedContent -Title $source.Title -Markdown $markdown -MinimumLength $MinContentLength
            $metrics = Get-ContentMetrics -Markdown $markdown
            if (-not $check.IsValid) {
                $status = 'failed'
                $error = $check.Error
            }
            if ($check.Warning) {
                $warning = (($warning, $check.Warning) | Where-Object { $_ }) -join ' '
            }
            if ($metrics.PossibleNavigationNoise) {
                $warning = (($warning, '页面可能包含较多导航或推荐链接，建议检查正文边界。') | Where-Object { $_ }) -join ' '
            }
        } else {
            $metrics = [pscustomobject]@{ LineCount = 0; LinkCount = 0; ImageCount = 0; LinkLineRatio = 0; PossibleNavigationNoise = $false }
        }
        $results.Add([pscustomobject][ordered]@{
            Index = $item.Index
            Url = $item.Url
            Host = 'mp.weixin.qq.com'
            Method = $source.Method
            Status = $status
            Title = $source.Title
            Author = $source.Author
            PublishTime = $source.PublishTime
            ContentLength = $source.ContentLength
            RawContentLength = $source.ContentLength
            ContentScope = 'wechat-article'
            LineCount = $metrics.LineCount
            LinkCount = $metrics.LinkCount
            ImageCount = $metrics.ImageCount
            LinkLineRatio = $metrics.LinkLineRatio
            PossibleNavigationNoise = $metrics.PossibleNavigationNoise
            MarkdownPath = $source.MarkdownPath
            Attempts = $source.Attempts
            RouteHistory = $source.RouteHistory
            Warning = $warning
            Error = $error
        })
    }
}

if ($genericItems.Count -gt 0) {
    $browserAct = Get-Command browser-act -ErrorAction SilentlyContinue
    $extractor = Join-Path $PSScriptRoot 'direct_extract.py'
    $directRuntime = if ($DisableDirectExtraction) { $null } else { Get-TrafilaturaRuntime -ExtractorPath $extractor }
    $browserId = $null
    $browserSetupError = ''
    if ($browserAct -and -not $DisableLocalBrowser -and $BrowserName) {
        try {
            $browserId = Get-BrowserId -BrowserActPath $browserAct.Source -Name $BrowserName
        } catch {
            $browserSetupError = $_.Exception.Message
        }
    } elseif ($browserAct -and -not $DisableLocalBrowser) {
        $browserSetupError = '未指定BrowserAct本地浏览器名称；如需使用本地浏览器路径，请传入-BrowserName或设置BROWSERACT_BROWSER_NAME。'
    }
    $uv = Get-Command uv -ErrorAction SilentlyContinue
    $uvToolDirectory = if ($uv) { (& $uv.Source tool dir | Out-String).Trim() } else { '' }
    $browserPython = if ($uvToolDirectory) { Join-Path $uvToolDirectory 'browser-act-cli\Scripts\python.exe' } else { '' }
    $converter = Join-Path $PSScriptRoot 'html_to_markdown.py'
    $semanticExtractionAvailable = (Test-Path -LiteralPath $browserPython) -and (Test-Path -LiteralPath $converter)

    foreach ($item in $genericItems) {
        $result = [ordered]@{
            Index = $item.Index
            Url = $item.Url
            Host = ([uri]$item.Url).Host
            Method = ''
            Status = 'failed'
            Title = ''
            Author = ''
            PublishTime = ''
            ContentLength = 0
            RawContentLength = 0
            ContentScope = ''
            LineCount = 0
            LinkCount = 0
            ImageCount = 0
            LinkLineRatio = 0
            PossibleNavigationNoise = $false
            MarkdownPath = ''
            Attempts = 0
            RouteHistory = ''
            Warning = ''
            Error = ''
        }
        $routeErrors = [System.Collections.Generic.List[string]]::new()
        $routeHistory = [System.Collections.Generic.List[string]]::new()
        $restrictionDetected = $false

        if ($directRuntime) {
            $routeHistory.Add('trafilatura-direct')
            for ($attempt = 1; $attempt -le 2; $attempt++) {
                $result.Attempts++
                try {
                    $direct = Invoke-TrafilaturaExtraction -Runtime $directRuntime -Url $item.Url
                    $title = if ($direct.Title) { $direct.Title } else { Get-MarkdownHeading -Markdown $direct.Markdown }
                    $check = Test-ExtractedContent -Title $title -Markdown $direct.Markdown -MinimumLength $MinContentLength
                    if (-not $check.IsValid) {
                        throw $check.Error
                    }
                    $metrics = Get-ContentMetrics -Markdown $direct.Markdown
                    $fileName = Get-SafeFileName -Index $item.Index -Title $title
                    $markdownPath = Join-Path $runDirectory $fileName
                    $direct.Markdown.TrimEnd() | Set-Content -LiteralPath $markdownPath -Encoding utf8

                    $result.Status = 'success'
                    $result.Method = 'trafilatura-direct'
                    $result.Title = $title
                    $result.Author = $direct.Author
                    $result.PublishTime = $direct.PublishTime
                    $result.ContentLength = $direct.Markdown.Length
                    $result.RawContentLength = $direct.Markdown.Length
                    $result.ContentScope = 'article:trafilatura'
                    $result.LineCount = $metrics.LineCount
                    $result.LinkCount = $metrics.LinkCount
                    $result.ImageCount = $metrics.ImageCount
                    $result.LinkLineRatio = $metrics.LinkLineRatio
                    $result.PossibleNavigationNoise = $metrics.PossibleNavigationNoise
                    $result.MarkdownPath = $markdownPath
                    $result.Warning = $check.Warning
                    break
                } catch {
                    $routeErrors.Add("Trafilatura直取第${attempt}次：$($_.Exception.Message)")
                    if ($_.Exception.Message -match '访问限制、登录或验证页面|网页下载结果为空') {
                        $restrictionDetected = $true
                        break
                    }
                }
            }
        } elseif ($DisableDirectExtraction) {
            $routeErrors.Add('Trafilatura直接提取路径已按参数关闭。')
        } else {
            $routeErrors.Add('未找到Trafilatura运行环境，无法直接提取普通网页。')
        }

        if ($result.Status -ne 'success' -and -not $restrictionDetected -and -not $DisableLocalBrowser -and $browserAct -and $browserId) {
            $routeHistory.Add('browseract-local-chrome')
            for ($attempt = 1; $attempt -le 2; $attempt++) {
                $result.Attempts++
                $sessionSuffix = [guid]::NewGuid().ToString('N').Substring(0, 8)
                $session = "wcr-$timestamp-$($item.Index)-$attempt-$sessionSuffix"
                try {
                    $openOutput = & $browserAct.Source --session $session browser open $browserId $item.Url 2>&1 | Out-String
                    if ($LASTEXITCODE -ne 0) {
                        throw "打开网页失败：$($openOutput.Trim())"
                    }
                    $waitWarning = ''
                    $waitOutput = & $browserAct.Source --session $session wait stable --timeout 15000 2>&1 | Out-String
                    if ($LASTEXITCODE -ne 0) {
                        $waitWarning = '页面在15秒内未完全稳定，已继续检查当前加载内容。'
                    }
                    $title = (& $browserAct.Source --session $session get title 2>&1 | Out-String).Trim()
                    if ($LASTEXITCODE -ne 0) {
                        throw '读取网页标题失败。'
                    }
                    $markdown = & $browserAct.Source --session $session get markdown 2>&1 | Out-String
                    if ($LASTEXITCODE -ne 0) {
                        throw '读取网页正文失败。'
                    }

                    $rawContentLength = $markdown.Length
                    $contentScope = 'full-page'
                    $semanticWarning = ''
                    if ($semanticExtractionAvailable) {
                        try {
                            $semantic = Get-SemanticMarkdown -BrowserActPath $browserAct.Source -Session $session -PythonPath $browserPython -ConverterPath $converter
                            if (($semantic.Markdown -replace '\s+', '').Length -ge $MinContentLength) {
                                $markdown = $semantic.Markdown
                                $contentScope = 'semantic:' + $semantic.Selector
                                $pageHost = ([uri]$item.Url).Host
                                if ($semantic.Heading -and ($title -eq $pageHost -or $title -like "$pageHost/*" -or $title -match '^[A-Za-z0-9.-]+/' -or -not $title)) {
                                    $title = $semantic.Heading
                                }
                            } else {
                                $semanticWarning = '正文容器提取结果过短，已保留整页内容。'
                            }
                        } catch {
                            $semanticWarning = '正文容器提取失败，已保留整页内容。'
                        }
                    } else {
                        $semanticWarning = '缺少HTML转Markdown运行环境，已保留整页内容。'
                    }

                    $check = Test-ExtractedContent -Title $title -Markdown $markdown -MinimumLength $MinContentLength
                    if (-not $check.IsValid) {
                        throw $check.Error
                    }
                    $metrics = Get-ContentMetrics -Markdown $markdown

                    $fileName = Get-SafeFileName -Index $item.Index -Title $title
                    $markdownPath = Join-Path $runDirectory $fileName
                    $markdown.TrimEnd() | Set-Content -LiteralPath $markdownPath -Encoding utf8

                    $possibleNavigationNoise = $metrics.PossibleNavigationNoise -or ($contentScope -eq 'semantic:body' -and $metrics.LinkCount -ge 10)
                    $result.Status = 'success'
                    $result.Method = 'browseract-local-chrome'
                    $result.Title = $title
                    $result.ContentLength = $markdown.Length
                    $result.RawContentLength = $rawContentLength
                    $result.ContentScope = $contentScope
                    $result.LineCount = $metrics.LineCount
                    $result.LinkCount = $metrics.LinkCount
                    $result.ImageCount = $metrics.ImageCount
                    $result.LinkLineRatio = $metrics.LinkLineRatio
                    $result.PossibleNavigationNoise = $possibleNavigationNoise
                    $result.MarkdownPath = $markdownPath
                    $warnings = @(($check.Warning, $waitWarning, $semanticWarning, '轻量直取未通过验收，已回退至本地浏览器。') | Where-Object { $_ })
                    if ($possibleNavigationNoise) {
                        $warnings += '页面可能包含较多导航或推荐链接，建议检查正文边界。'
                    }
                    $result.Warning = $warnings -join ' '
                    break
                } catch {
                    $routeErrors.Add("本地浏览器第${attempt}次：$($_.Exception.Message)")
                    if ($_.Exception.Message -match '访问限制、登录或验证页面') {
                        $restrictionDetected = $true
                        break
                    }
                } finally {
                    & $browserAct.Source session close $session 2>&1 | Out-Null
                }
            }
        } elseif ($result.Status -ne 'success' -and -not $DisableLocalBrowser) {
            if (-not $browserAct) {
                $routeErrors.Add('未找到BrowserAct，无法使用本地浏览器。')
            } elseif (-not $browserId) {
                $routeErrors.Add("本地浏览器不可用：$browserSetupError")
            }
        } elseif ($result.Status -ne 'success') {
            $routeErrors.Add('BrowserAct本地浏览器路径已按参数关闭。')
        }

        if ($result.Status -ne 'success' -and -not $DisableStealthFallback -and $browserAct) {
            $routeHistory.Add('browseract-stealth')
            for ($attempt = 1; $attempt -le $StealthAttempts; $attempt++) {
                $result.Attempts++
                try {
                    $stealth = Invoke-StealthExtraction -BrowserActPath $browserAct.Source -Url $item.Url -DirectRuntime $directRuntime
                    $check = Test-ExtractedContent -Title $stealth.Title -Markdown $stealth.Markdown -MinimumLength $MinContentLength
                    if (-not $check.IsValid) {
                        throw $check.Error
                    }
                    $metrics = Get-ContentMetrics -Markdown $stealth.Markdown
                    $fileName = Get-SafeFileName -Index $item.Index -Title $stealth.Title
                    $markdownPath = Join-Path $runDirectory $fileName
                    $stealth.Markdown.TrimEnd() | Set-Content -LiteralPath $markdownPath -Encoding utf8

                    $result.Status = 'success'
                    $result.Method = 'browseract-stealth'
                    $result.Title = $stealth.Title
                    $result.ContentLength = $stealth.Markdown.Length
                    $result.RawContentLength = $stealth.Markdown.Length
                    $result.ContentScope = $stealth.ContentScope
                    $result.LineCount = $metrics.LineCount
                    $result.LinkCount = $metrics.LinkCount
                    $result.ImageCount = $metrics.ImageCount
                    $result.LinkLineRatio = $metrics.LinkLineRatio
                    $result.PossibleNavigationNoise = $metrics.PossibleNavigationNoise
                    $result.MarkdownPath = $markdownPath
                    $warnings = @(($check.Warning, '前序公开网页路径未通过验收，已回退至BrowserAct隐身提取。') | Where-Object { $_ })
                    if ($metrics.PossibleNavigationNoise) {
                        $warnings += '页面可能包含较多导航、广告或推荐链接，建议检查正文边界。'
                    }
                    $result.Warning = $warnings -join ' '
                    break
                } catch {
                    $routeErrors.Add("BrowserAct隐身提取第${attempt}次：$($_.Exception.Message)")
                }
            }
        } elseif ($result.Status -ne 'success' -and $DisableStealthFallback) {
            $routeErrors.Add('BrowserAct隐身提取路径已按参数关闭。')
        } elseif ($result.Status -ne 'success') {
            $routeErrors.Add('未找到BrowserAct，无法执行隐身提取备用路径。')
        }

        $result.RouteHistory = $routeHistory -join ' -> '
        if ($result.Status -eq 'success') {
            $result.Error = ''
        } else {
            $result.Error = $routeErrors -join ' | '
        }
        $results.Add([pscustomobject]$result)
    }
}

$orderedResults = @($results | Sort-Object Index)
$manifestPath = Join-Path $runDirectory 'manifest.json'
$orderedResults | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $manifestPath -Encoding utf8

$summary = [pscustomobject]@{
    RunDirectory = $runDirectory
    ManifestPath = $manifestPath
    Total = $orderedResults.Count
    Success = @($orderedResults | Where-Object Status -eq 'success').Count
    Failed = @($orderedResults | Where-Object Status -eq 'failed').Count
    Retried = @($orderedResults | Where-Object Attempts -gt 1).Count
    WithWarnings = @($orderedResults | Where-Object Warning).Count
    Results = $orderedResults
}

$summary | ConvertTo-Json -Depth 7
