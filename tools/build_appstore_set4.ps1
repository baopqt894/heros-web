param(
    [string]$ProjectRoot = 'D:\Heros-be\heros-web',
    [string]$OutputRoot = 'D:\Heros-be\heros-web\output\app-store-screenshots-set-4'
)

Add-Type -AssemblyName System.Drawing

if (-not ('TitleExtractor' -as [type])) {
    Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Imaging;

public static class TitleExtractor
{
    private static bool[] Dilate(bool[] source, int width, int height, int radius)
    {
        bool[] horizontal = new bool[source.Length];
        bool[] output = new bool[source.Length];

        for (int y = 0; y < height; y++)
        {
            int count = 0;
            for (int x = -radius; x <= radius; x++)
                if (x >= 0 && x < width && source[y * width + x]) count++;

            for (int x = 0; x < width; x++)
            {
                horizontal[y * width + x] = count > 0;
                int removeX = x - radius;
                int addX = x + radius + 1;
                if (removeX >= 0 && source[y * width + removeX]) count--;
                if (addX < width && source[y * width + addX]) count++;
            }
        }

        for (int x = 0; x < width; x++)
        {
            int count = 0;
            for (int y = -radius; y <= radius; y++)
                if (y >= 0 && y < height && horizontal[y * width + x]) count++;

            for (int y = 0; y < height; y++)
            {
                output[y * width + x] = count > 0;
                int removeY = y - radius;
                int addY = y + radius + 1;
                if (removeY >= 0 && horizontal[removeY * width + x]) count--;
                if (addY < height && horizontal[addY * width + x]) count++;
            }
        }
        return output;
    }

    public static Bitmap Extract(Bitmap source, int titleHeight)
    {
        int width = source.Width;
        int height = Math.Min(titleHeight, source.Height);
        bool[] fillMask = new bool[width * height];

        for (int y = 0; y < height; y++)
        {
            for (int x = 0; x < width; x++)
            {
                Color c = source.GetPixel(x, y);
                int max = Math.Max(c.R, Math.Max(c.G, c.B));
                int min = Math.Min(c.R, Math.Min(c.G, c.B));
                double saturation = max == 0 ? 0 : (double)(max - min) / max;
                bool pinkOrPurple = c.R > 105 && saturation > 0.43 &&
                    (c.R > c.G + 28 || c.B > c.G + 18);
                fillMask[y * width + x] = pinkOrPurple;
            }
        }

        bool[] whiteMask = Dilate(fillMask, width, height, 7);
        bool[] shadowMask = Dilate(fillMask, width, height, 11);
        Bitmap result = new Bitmap(width, height, PixelFormat.Format32bppArgb);

        for (int y = 0; y < height; y++)
        {
            for (int x = 0; x < width; x++)
            {
                int index = y * width + x;
                if (fillMask[index])
                {
                    Color c = source.GetPixel(x, y);
                    result.SetPixel(x, y, Color.FromArgb(255, c.R, c.G, c.B));
                }
                else if (whiteMask[index])
                {
                    result.SetPixel(x, y, Color.FromArgb(248, 255, 255, 255));
                }
                else if (shadowMask[index])
                {
                    result.SetPixel(x, y, Color.FromArgb(48, 135, 38, 132));
                }
            }
        }
        return result;
    }
}
'@
}

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

function New-IPhone16Mockup {
    $mockup = [System.Drawing.Bitmap]::new(853, 1844, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($mockup)
    try {
        $g.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
        $g.Clear([System.Drawing.Color]::Transparent)
        $g.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

        $screenHole = New-RoundedPath -X 103 -Y 376 -Width 647 -Height 1400 -Radius 61

        # A ring-only shadow keeps the display opening transparent.
        $shadowRing = [System.Drawing.Drawing2D.GraphicsPath]::new([System.Drawing.Drawing2D.FillMode]::Alternate)
        $shadowOuter = New-RoundedPath -X 72 -Y 365 -Width 709 -Height 1447 -Radius 87
        try {
            $shadowRing.AddPath($shadowOuter, $false)
            $shadowRing.AddPath($screenHole, $false)
            $shadowBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(64, 86, 25, 91))
            try { $g.FillPath($shadowBrush, $shadowRing) }
            finally { $shadowBrush.Dispose() }
        }
        finally { $shadowOuter.Dispose(); $shadowRing.Dispose() }

        # One fixed black iPhone 16 body with the same screen opening on every asset.
        $bodyRing = [System.Drawing.Drawing2D.GraphicsPath]::new([System.Drawing.Drawing2D.FillMode]::Alternate)
        $bodyOuter = New-RoundedPath -X 80 -Y 353 -Width 693 -Height 1447 -Radius 83
        try {
            $bodyRing.AddPath($bodyOuter, $false)
            $bodyRing.AddPath($screenHole, $false)
            $blackBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 8, 8, 11))
            try { $g.FillPath($blackBrush, $bodyRing) }
            finally { $blackBrush.Dispose() }
        }
        finally { $bodyOuter.Dispose(); $bodyRing.Dispose() }

        $edgePen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(255, 52, 52, 58), 5)
        $edgePath = New-RoundedPath -X 84 -Y 357 -Width 685 -Height 1439 -Radius 79
        try { $g.DrawPath($edgePen, $edgePath) }
        finally { $edgePath.Dispose(); $edgePen.Dispose() }

        $blackBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 8, 8, 11))
        $islandPath = New-RoundedPath -X 333 -Y 393 -Width 187 -Height 51 -Radius 25.5
        try { $g.FillPath($blackBrush, $islandPath) }
        finally { $islandPath.Dispose(); $blackBrush.Dispose() }

        $buttonPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(255, 22, 22, 26), 7)
        try {
            $g.DrawLine($buttonPen, 79, 538, 79, 623)
            $g.DrawLine($buttonPen, 79, 658, 79, 768)
            $g.DrawLine($buttonPen, 774, 598, 774, 743)
        }
        finally { $buttonPen.Dispose(); $screenHole.Dispose() }
    }
    finally { $g.Dispose() }
    return $mockup
}

$items = @(
    @{ File = '01-cai-dat.png'; Screenshot = 'C:\Users\Lenovo\Downloads\screenshot 1\89c7e282-9439-48dd-83f3-7e06883c6f79.jpg'; TitleOffsetY = 0; TitleExtractHeight = 350 },
    @{ File = '02-dang-nhap.png'; Screenshot = 'C:\Users\Lenovo\Downloads\screenshot 1\6a3cb2ab-7b6d-4cb7-a113-b3e51fd7c148.jpg'; TitleOffsetY = 0; TitleExtractHeight = 350 },
    @{ File = '03-khoi-dong.png'; Screenshot = 'C:\Users\Lenovo\Downloads\screenshot 1\37cdccf9-3fb4-47c6-bf4f-8bd9b98f3c5d.jpg'; TitleOffsetY = -82; TitleExtractHeight = 430 },
    @{ File = '04-sos-dang-phat.png'; Screenshot = 'C:\Users\Lenovo\Downloads\screenshot 1\a417d829-f9bf-4825-9213-d5c984cdec84.jpg'; TitleOffsetY = 0; TitleExtractHeight = 350 },
    @{ File = '05-sos-an-toan.png'; Screenshot = 'C:\Users\Lenovo\Downloads\screenshot 1\998bc38f-a9de-4c04-bf11-180856c2e8f0.jpg'; TitleOffsetY = 0; TitleExtractHeight = 350 },
    @{ File = '06-ban-ghi.png'; Screenshot = 'C:\Users\Lenovo\Downloads\screenshot 1\971c330b-3e5a-47c3-a2f0-f3e5c304624b.jpg'; TitleOffsetY = 0; TitleExtractHeight = 350 },
    @{ File = '07-thiet-bi.png'; Screenshot = 'C:\Users\Lenovo\Downloads\screenshot 1\anh.jpg'; TitleOffsetY = 0; TitleExtractHeight = 350 }
)

$sourceCopyDir = Join-Path $OutputRoot 'source-copy-set-1'
$backgroundPath = Join-Path $OutputRoot 'background-set3.png'
$nativeDir = Join-Path $OutputRoot 'native-853x1844'
$uploadDir = Join-Path $OutputRoot 'upload-ready-1290x2796'
New-Item -ItemType Directory -Force -Path $nativeDir, $uploadDir | Out-Null

$background = [System.Drawing.Image]::FromFile($backgroundPath)
$mockupOverlay = New-IPhone16Mockup
$mockupOverlay.Save((Join-Path $OutputRoot 'mockup-iphone16-black-master.png'), [System.Drawing.Imaging.ImageFormat]::Png)
try {
    foreach ($item in $items) {
        $oldPanelPath = Join-Path $sourceCopyDir $item.File
        $oldPanel = [System.Drawing.Bitmap]::FromFile($oldPanelPath)
        try { $titleOverlay = [TitleExtractor]::Extract($oldPanel, $item.TitleExtractHeight) }
        finally { $oldPanel.Dispose() }

        $canvas = [System.Drawing.Bitmap]::new(853, 1844, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
        try {
            $g = [System.Drawing.Graphics]::FromImage($canvas)
            try {
                $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
                $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
                $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
                $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
                $g.DrawImage($background, 0, 0, 853, 1844)
                $g.DrawImage($titleOverlay, 0, $item.TitleOffsetY, 853, $item.TitleExtractHeight)

                $screenX = 103
                $screenY = 376
                $screenW = 647
                $screenH = 1400
                $screenPath = New-RoundedPath -X $screenX -Y $screenY -Width $screenW -Height $screenH -Radius 61
                $state = $g.Save()
                try {
                    $g.SetClip($screenPath)
                    $screen = [System.Drawing.Image]::FromFile($item.Screenshot)
                    try { $g.DrawImage($screen, $screenX, $screenY, $screenW, $screenH) }
                    finally { $screen.Dispose() }
                }
                finally {
                    $g.Restore($state)
                    $screenPath.Dispose()
                }

                # The same master overlay is composited pixel-for-pixel on all seven images.
                $g.DrawImage($mockupOverlay, 0, 0, 853, 1844)
            }
            finally { $g.Dispose(); $titleOverlay.Dispose() }

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
finally { $background.Dispose(); $mockupOverlay.Dispose() }

Get-ChildItem -LiteralPath $uploadDir -Filter '*.png' | Sort-Object Name | ForEach-Object {
    $image = [System.Drawing.Image]::FromFile($_.FullName)
    try {
        $alpha = [System.Drawing.Image]::IsAlphaPixelFormat($image.PixelFormat)
        "{0}`t{1}x{2}`talpha={3}" -f $_.Name, $image.Width, $image.Height, $alpha
    }
    finally { $image.Dispose() }
}
