param(
    [string]$BackgroundPath = 'C:\Users\Lenovo\.codex\generated_images\01a110e6-0367-7c32-adee-9d49cb9db18c\exec-cce24970-ba2c-455c-a433-743d143e3736.png',
    [string]$OutputRoot = 'D:\Heros-be\heros-web\output\app-store-screenshots-set-3',
    [string]$FontPath = 'D:\Heros-be\heros-web\assets\fonts\fredoka\Fredoka-Bold.ttf'
)

Add-Type -AssemblyName System.Drawing

$script:HeadlineFonts = [System.Drawing.Text.PrivateFontCollection]::new()
$script:HeadlineFonts.AddFontFile($FontPath)
$script:HeadlineFontFamily = $script:HeadlineFonts.Families[0]

function New-RoundedPath {
    param([float]$X, [float]$Y, [float]$Width, [float]$Height, [float]$Radius)
    $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $d = $Radius * 2
    $path.AddArc($X, $Y, $d, $d, 180, 90)
    $path.AddArc($X + $Width - $d, $Y, $d, $d, 270, 90)
    $path.AddArc($X + $Width - $d, $Y + $Height - $d, $d, $d, 0, 90)
    $path.AddArc($X, $Y + $Height - $d, $d, $d, 90, 90)
    $path.CloseFigure()
    return $path
}

function Draw-CuteHeadline {
    param([System.Drawing.Graphics]$Graphics, [string]$Text)

    $family = $script:HeadlineFontFamily
    $format = [System.Drawing.StringFormat]::new()
    try {
        $format.Alignment = [System.Drawing.StringAlignment]::Center
        $format.LineAlignment = [System.Drawing.StringAlignment]::Center
        $format.Trimming = [System.Drawing.StringTrimming]::None

        $lines = $Text -split "`n", 2
        $colors = @(
            [System.Drawing.Color]::FromArgb(255, 250, 55, 123),
            [System.Drawing.Color]::FromArgb(255, 139, 34, 139)
        )
        $lineRects = @(
            [System.Drawing.RectangleF]::new(44, 43, 765, 108),
            [System.Drawing.RectangleF]::new(44, 138, 765, 98)
        )

        for ($lineIndex = 0; $lineIndex -lt $lines.Count; $lineIndex++) {
            if ($lineIndex -eq 0) { $fontSize = 70 }
            else { $fontSize = 56 }
            $path = $null
            while ($fontSize -ge 40) {
                if ($null -ne $path) { $path.Dispose() }
                $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
                $path.AddString($lines[$lineIndex], $family, [int][System.Drawing.FontStyle]::Bold, $fontSize, $lineRects[$lineIndex], $format)
                if ($path.GetBounds().Width -le 730) { break }
                $fontSize -= 2
            }

            $shadowPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(30, 113, 24, 105), 13)
            $whitePen = [System.Drawing.Pen]::new([System.Drawing.Color]::White, 10)
            $shadowPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
            $whitePen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
            $fill = [System.Drawing.SolidBrush]::new($colors[$lineIndex])
            try {
                $Graphics.DrawPath($shadowPen, $path)
                $Graphics.DrawPath($whitePen, $path)
                $Graphics.FillPath($fill, $path)
            }
            finally {
                $shadowPen.Dispose()
                $whitePen.Dispose()
                $fill.Dispose()
                $path.Dispose()
            }
        }
    }
    finally {
        $format.Dispose()
    }
}

$items = @(
    @{ File = '01-khoi-dong.png'; Source = 'C:\Users\Lenovo\Downloads\screenshot 1\37cdccf9-3fb4-47c6-bf4f-8bd9b98f3c5d.jpg'; Headline = "An toàn luôn`nở bên bạn" },
    @{ File = '02-dang-nhap.png'; Source = 'C:\Users\Lenovo\Downloads\screenshot 1\6a3cb2ab-7b6d-4cb7-a113-b3e51fd7c148.jpg'; Headline = "Kết nối với người`nbạn tin tưởng" },
    @{ File = '03-sos-an-toan.png'; Source = 'C:\Users\Lenovo\Downloads\screenshot 1\998bc38f-a9de-4c04-bf11-180856c2e8f0.jpg'; Headline = "Trợ giúp luôn`ntrong tầm tay" },
    @{ File = '04-sos-dang-phat.png'; Source = 'C:\Users\Lenovo\Downloads\screenshot 1\a417d829-f9bf-4825-9213-d5c984cdec84.jpg'; Headline = "Gửi SOS`nchỉ trong vài giây" },
    @{ File = '05-thiet-bi.png'; Source = 'C:\Users\Lenovo\Downloads\screenshot 1\anh.jpg'; Headline = "Kết nối thiết bị`nbảo vệ bạn" },
    @{ File = '06-ban-ghi.png'; Source = 'C:\Users\Lenovo\Downloads\screenshot 1\971c330b-3e5a-47c3-a2f0-f3e5c304624b.jpg'; Headline = "Lưu lại khoảnh khắc`nquan trọng" },
    @{ File = '07-cai-dat.png'; Source = 'C:\Users\Lenovo\Downloads\screenshot 1\89c7e282-9439-48dd-83f3-7e06883c6f79.jpg'; Headline = "An tâm`ntrong từng cài đặt" }
)

$nativeDir = Join-Path $OutputRoot 'native-853x1844'
$uploadDir = Join-Path $OutputRoot 'upload-ready-1290x2796'
New-Item -ItemType Directory -Force -Path $nativeDir, $uploadDir | Out-Null

$background = [System.Drawing.Image]::FromFile($BackgroundPath)
try {
    foreach ($item in $items) {
        $canvas = [System.Drawing.Bitmap]::new(853, 1844, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
        try {
            $g = [System.Drawing.Graphics]::FromImage($canvas)
            try {
                $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
                $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
                $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
                $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
                $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
                $g.DrawImage($background, 0, 0, 853, 1844)

                Draw-CuteHeadline -Graphics $g -Text $item.Headline

                # Identical black iPhone 16 mockup geometry for every panel.
                $shadowBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(64, 86, 25, 91))
                $shadowPath = New-RoundedPath -X 72 -Y 365 -Width 709 -Height 1447 -Radius 87
                try { $g.FillPath($shadowBrush, $shadowPath) } finally { $shadowPath.Dispose(); $shadowBrush.Dispose() }

                $blackBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 8, 8, 11))
                $bodyPath = New-RoundedPath -X 80 -Y 353 -Width 693 -Height 1447 -Radius 83
                try { $g.FillPath($blackBrush, $bodyPath) } finally { $bodyPath.Dispose() }

                $edgePen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(255, 52, 52, 58), 5)
                $edgePath = New-RoundedPath -X 84 -Y 357 -Width 685 -Height 1439 -Radius 79
                try { $g.DrawPath($edgePen, $edgePath) } finally { $edgePath.Dispose(); $edgePen.Dispose() }

                $screenX = 103
                $screenY = 376
                $screenW = 647
                $screenH = 1400
                $screenPath = New-RoundedPath -X $screenX -Y $screenY -Width $screenW -Height $screenH -Radius 61
                $state = $g.Save()
                try {
                    $g.SetClip($screenPath)
                    $screen = [System.Drawing.Image]::FromFile($item.Source)
                    try { $g.DrawImage($screen, $screenX, $screenY, $screenW, $screenH) }
                    finally { $screen.Dispose() }
                }
                finally {
                    $g.Restore($state)
                    $screenPath.Dispose()
                }

                # Same Dynamic Island and controls on all seven phones.
                $islandPath = New-RoundedPath -X 333 -Y 393 -Width 187 -Height 51 -Radius 25.5
                try { $g.FillPath($blackBrush, $islandPath) } finally { $islandPath.Dispose() }
                $buttonPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(255, 22, 22, 26), 7)
                try {
                    $g.DrawLine($buttonPen, 79, 538, 79, 623)
                    $g.DrawLine($buttonPen, 79, 658, 79, 768)
                    $g.DrawLine($buttonPen, 774, 598, 774, 743)
                }
                finally { $buttonPen.Dispose(); $blackBrush.Dispose() }
            }
            finally { $g.Dispose() }

            $nativePath = Join-Path $nativeDir $item.File
            $canvas.Save($nativePath, [System.Drawing.Imaging.ImageFormat]::Png)

            $upload = [System.Drawing.Bitmap]::new(1290, 2796, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
            try {
                $ug = [System.Drawing.Graphics]::FromImage($upload)
                try {
                    $ug.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
                    $ug.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
                    $ug.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
                    $ug.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
                    $ug.DrawImage($canvas, 0, 3, 1290, 2790)
                }
                finally { $ug.Dispose() }
                $upload.Save((Join-Path $uploadDir $item.File), [System.Drawing.Imaging.ImageFormat]::Png)
            }
            finally { $upload.Dispose() }
        }
        finally { $canvas.Dispose() }
    }
}
finally { $background.Dispose() }

$script:HeadlineFonts.Dispose()

Get-ChildItem -LiteralPath $uploadDir -Filter '*.png' | Sort-Object Name | ForEach-Object {
    $image = [System.Drawing.Image]::FromFile($_.FullName)
    try {
        $alpha = [System.Drawing.Image]::IsAlphaPixelFormat($image.PixelFormat)
        "{0}`t{1}x{2}`talpha={3}" -f $_.Name, $image.Width, $image.Height, $alpha
    }
    finally { $image.Dispose() }
}
