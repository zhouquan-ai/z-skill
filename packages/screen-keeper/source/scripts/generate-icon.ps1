$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot
$assetsDirectory = Join-Path $projectRoot 'assets'
$pngPath = Join-Path $assetsDirectory 'icon.png'
$icoPath = Join-Path $assetsDirectory 'icon.ico'

New-Item -ItemType Directory -Path $assetsDirectory -Force | Out-Null

$size = 256
$bitmap = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.Clear([System.Drawing.Color]::Transparent)

function New-RoundedRectanglePath([float]$x, [float]$y, [float]$width, [float]$height, [float]$radius) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $diameter = $radius * 2
  $path.AddArc($x, $y, $diameter, $diameter, 180, 90)
  $path.AddArc($x + $width - $diameter, $y, $diameter, $diameter, 270, 90)
  $path.AddArc($x + $width - $diameter, $y + $height - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($x, $y + $height - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

$background = New-RoundedRectanglePath 12 12 232 232 54
$screen = New-RoundedRectanglePath 44 57 168 115 20
$backgroundBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 222, 237, 255))
$whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$blueBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 35, 112, 210))
$bluePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 35, 112, 210), 10)
$bluePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$bluePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round

$graphics.FillPath($backgroundBrush, $background)
$graphics.FillPath($whiteBrush, $screen)
$graphics.DrawPath($bluePen, $screen)
$graphics.DrawLine($bluePen, 128, 172, 128, 196)
$graphics.DrawLine($bluePen, 97, 196, 159, 196)
$graphics.FillEllipse($blueBrush, 102, 89, 52, 52)
$graphics.FillEllipse($whiteBrush, 117, 84, 46, 46)

$bitmap.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)

$graphics.Dispose()
$background.Dispose()
$screen.Dispose()
$backgroundBrush.Dispose()
$whiteBrush.Dispose()
$blueBrush.Dispose()
$bluePen.Dispose()
$bitmap.Dispose()

[byte[]]$pngBytes = [System.IO.File]::ReadAllBytes($pngPath)
$stream = [System.IO.File]::Open($icoPath, [System.IO.FileMode]::Create)
$writer = New-Object System.IO.BinaryWriter($stream)
$writer.Write([uint16]0)
$writer.Write([uint16]1)
$writer.Write([uint16]1)
$writer.Write([byte]0)
$writer.Write([byte]0)
$writer.Write([byte]0)
$writer.Write([byte]0)
$writer.Write([uint16]1)
$writer.Write([uint16]32)
$writer.Write([uint32]$pngBytes.Length)
$writer.Write([uint32]22)
$writer.Write($pngBytes)
$writer.Dispose()
$stream.Dispose()

Write-Output 'Generated assets/icon.png and assets/icon.ico'
