param(
    [string]$BackgroundPath = 'C:\Users\Lenovo\.codex\generated_images\01a110e6-0367-7c32-adee-9d49cb9db18c\exec-1939fb3a-300f-46b8-b1f6-9c2f7fa6acf9.png',
    [string]$OutputRoot = 'D:\Heros-be\heros-web\output\app-store-screenshots-set-2'
)

Add-Type -AssemblyName System.Drawing

function New-RoundedPath {
    param([float]$X, [float]$Y, [float]$Width, [float]$Height, [float]$Radius)
    $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $diameter = $Radius * 2
    $path.AddArc($X, $Y, $diameter, $diameter, 180, 90)
    $path.AddArc($X + $Width - $diameter, $Y, $diameter, $diameter, 270, 90)
    $path.AddArc($X + $Width - $diameter, $Y + $Height - $diameter, $diameter, $diameter, 0, 90)
    $path.AddArc($X, $Y + $Height - $diameter, $diameter, $diameter, 90, 90)
    $path.CloseFigure()
    return $path
}

function Draw-CenteredText {
    param(
        [System.Drawing.Graphics]$Graphics,
        [string]$Text,
        [System.Drawing.Font]$Font,
        [System.Drawing.Brush]$Brush,
        [System.Drawing.RectangleF]$Rect
    )
    $format = [System.Drawing.StringFormat]::new()
    try {
        $format.Alignment = [System.Drawing.StringAlignment]::Center
        $format.LineAlignment = [System.Drawing.StringAlignment]::Center
        $format.Trimming = [System.Drawing.StringTrimming]::None
        $Graphics.DrawString($Text, $Font, $Brush, $Rect, $format)
    }
    finally {
        $format.Dispose()
    }
}

$items = @(
    @{ File = '01-khoi-dong.png'; Source = 'C:\Users\Lenovo\Downloads\screenshot 1\37cdccf9-3fb4-47c6-bf4f-8bd9b98f3c5d.jpg'; Label = 'HEROS'; Headline = "An toàn luôn`nở bên bạn" },
    @{ File = '02-dang-nhap.png'; Source = 'C:\Users\Lenovo\Downloads\screenshot 1\6a3cb2ab-7b6d-4cb7-a113-b3e51fd7c148.jpg'; Label = 'KẾT NỐI AN TOÀN'; Headline = "Bắt đầu hành trình`nan tâm mỗi ngày" },
    @{ File = '03-sos-an-toan.png'; Source = 'C:\Users\Lenovo\Downloads\screenshot 1\998bc38f-a9de-4c04-bf11-180856c2e8f0.jpg'; Label = 'SOS THÔNG MINH'; Headline = "Trợ giúp luôn`ntrong tầm tay" },
    @{ File = '04-sos-dang-phat.png'; Source = 'C:\Users\Lenovo\Downloads\screenshot 1\a417d829-f9bf-4825-9213-d5c984cdec84.jpg'; Label = 'PHẢN HỒI TỨC THÌ'; Headline = "Gửi tín hiệu nhanh`nkhi bạn cần" },
    @{ File = '05-thiet-bi.png'; Source = 'C:\Users\Lenovo\Downloads\screenshot 1\anh.jpg'; Label = 'THIẾT BỊ HEROS'; Headline = "Một chạm nhỏ`nBảo vệ thật lớn" },
    @{ File = '06-ban-ghi.png'; Source = 'C:\Users\Lenovo\Downloads\screenshot 1\971c330b-3e5a-47c3-a2f0-f3e5c304624b.jpg'; Label = 'BẢO MẬT RIÊNG TƯ'; Headline = "Lưu giữ điều`nquan trọng" },
    @{ File = '07-cai-dat.png'; Source = 'C:\Users\Lenovo\Downloads\screenshot 1\89c7e282-9439-48dd-83f3-7e06883c6f79.jpg'; Label = 'TÙY CHỈNH AN TOÀN'; Headline = "An tâm trong từng`ncài đặt" }
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

                $labelFont = [System.Drawing.Font]::new('Segoe UI', 15, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
                $headlineFont = [System.Drawing.Font]::new('Segoe UI', 58, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
                $whiteBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
                $blackBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 8, 8, 12))
                try {
                    $labelSize = $g.MeasureString($item.Label, $labelFont)
                    $pillWidth = [Math]::Ceiling($labelSize.Width) + 34
                    $pillX = (853 - $pillWidth) / 2
                    $pillPath = New-RoundedPath -X $pillX -Y 56 -Width $pillWidth -Height 34 -Radius 17
                    try { $g.FillPath($blackBrush, $pillPath) } finally { $pillPath.Dispose() }
                    Draw-CenteredText -Graphics $g -Text $item.Label -Font $labelFont -Brush $whiteBrush -Rect ([System.Drawing.RectangleF]::new($pillX, 55, $pillWidth, 34))
                    Draw-CenteredText -Graphics $g -Text $item.Headline -Font $headlineFont -Brush $whiteBrush -Rect ([System.Drawing.RectangleF]::new(54, 96, 745, 245))

                    # Shared iPhone 16 shadow and black body. These coordinates never change.
                    $shadowBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(58, 18, 13, 38))
                    $shadowPath = New-RoundedPath -X 72 -Y 417 -Width 709 -Height 1448 -Radius 86
                    try { $g.FillPath($shadowBrush, $shadowPath) } finally { $shadowPath.Dispose(); $shadowBrush.Dispose() }

                    $bodyPath = New-RoundedPath -X 80 -Y 405 -Width 693 -Height 1448 -Radius 82
                    try { $g.FillPath($blackBrush, $bodyPath) } finally { $bodyPath.Dispose() }

                    $edgePen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(255, 52, 52, 58), 5)
                    $edgePath = New-RoundedPath -X 84 -Y 409 -Width 685 -Height 1440 -Radius 78
                    try { $g.DrawPath($edgePen, $edgePath) } finally { $edgePath.Dispose(); $edgePen.Dispose() }

                    # Exact screenshot area, clipped to the same rounded display corners for every image.
                    $screenX = 103
                    $screenY = 428
                    $screenW = 647
                    $screenH = 1400
                    $screenPath = New-RoundedPath -X $screenX -Y $screenY -Width $screenW -Height $screenH -Radius 61
                    $state = $g.Save()
                    try {
                        $g.SetClip($screenPath)
                        $screen = [System.Drawing.Image]::FromFile($item.Source)
                        try { $g.DrawImage($screen, $screenX, $screenY, $screenW, $screenH) } finally { $screen.Dispose() }
                    }
                    finally {
                        $g.Restore($state)
                        $screenPath.Dispose()
                    }

                    # Standard black Dynamic Island, same dimensions and placement across all seven panels.
                    $islandPath = New-RoundedPath -X 333 -Y 445 -Width 187 -Height 51 -Radius 25.5
                    try { $g.FillPath($blackBrush, $islandPath) } finally { $islandPath.Dispose() }

                    # Consistent side controls on the black iPhone 16 body.
                    $buttonPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(255, 22, 22, 26), 7)
                    try {
                        $g.DrawLine($buttonPen, 79, 590, 79, 675)
                        $g.DrawLine($buttonPen, 79, 710, 79, 820)
                        $g.DrawLine($buttonPen, 774, 650, 774, 795)
                    }
                    finally { $buttonPen.Dispose() }
                }
                finally {
                    $labelFont.Dispose()
                    $headlineFont.Dispose()
                    $whiteBrush.Dispose()
                    $blackBrush.Dispose()
                }
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

Get-ChildItem -LiteralPath $uploadDir -Filter '*.png' | Sort-Object Name | ForEach-Object {
    $image = [System.Drawing.Image]::FromFile($_.FullName)
    try {
        $alpha = [System.Drawing.Image]::IsAlphaPixelFormat($image.PixelFormat)
        "{0}`t{1}x{2}`talpha={3}" -f $_.Name, $image.Width, $image.Height, $alpha
    }
    finally { $image.Dispose() }
}
