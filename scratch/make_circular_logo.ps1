Add-Type -AssemblyName System.Drawing

$srcPath = "C:\develpment_charan\SNP_solar\assets\brand\logo.png"
$dstPath = "C:\develpment_charan\SNP_solar\assets\brand\logo-circular.png"

$src = [System.Drawing.Image]::FromFile($srcPath)
$size = [Math]::Min($src.Width, $src.Height)

# Center crop square
$x = [int](($src.Width - $size) / 2)
$y = [int](($src.Height - $size) / 2)

$bmp = New-Object System.Drawing.Bitmap($size, $size)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

$srcRect = New-Object System.Drawing.Rectangle($x, $y, $size, $size)
$dstRect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)

$g.DrawImage($src, $dstRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

$bmp.Save($dstPath, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$bmp.Dispose()
$src.Dispose()

Write-Output "Created logo-circular.png ($size x $size)"
