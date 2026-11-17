param(
  [ValidateSet("/", "/profesor", "/profesor/examenes/nuevo")]
  [string]$Route = "/"
)

$ErrorActionPreference = "Stop"

$projectDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$nodeDirectory = "C:\Program Files\nodejs"
$npmCommand = Join-Path $nodeDirectory "npm.cmd"
$baseUrl = "http://127.0.0.1:3000"
$localUrl = "$baseUrl$Route"

if (-not (Test-Path -LiteralPath $npmCommand)) {
  Write-Error "No se encontró Node.js en $nodeDirectory. Instala Node.js o ajusta la ruta en este lanzador."
  exit 1
}

$env:PATH = "$nodeDirectory;$env:PATH"
$listener = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($listener) {
  try {
    $existingPage = Invoke-WebRequest -Uri $baseUrl -TimeoutSec 3 -UseBasicParsing
    if ($existingPage.Content -match "<title>Arquitectura Adaptativa</title>") {
      Start-Process $localUrl
      Write-Host "ARQ·EXAM ya estaba abierto en $localUrl"
      exit 0
    }
  } catch {
    # The port may be starting; report a clear conflict below if it does not serve ARQ·EXAM.
  }
  Write-Error "El puerto 3000 ya está ocupado por otra aplicación. Cierra esa aplicación y vuelve a intentarlo."
  exit 1
}

if (-not (Test-Path -LiteralPath (Join-Path $projectDirectory ".env"))) {
  Write-Warning "No existe .env. Se abrirá la página; para iniciar exámenes y usar el panel configura PostgreSQL y las variables indicadas en .env.example."
}

$server = Start-Process -FilePath $npmCommand -ArgumentList @("run", "dev", "--", "--hostname", "127.0.0.1") -WorkingDirectory $projectDirectory -PassThru -NoNewWindow
$ready = $false
for ($attempt = 0; $attempt -lt 90; $attempt++) {
  if ($server.HasExited) {
    Write-Error "El servidor se cerró antes de estar listo. Revisa el mensaje de error en esta ventana."
    exit 1
  }
  try {
    $page = Invoke-WebRequest -Uri $localUrl -TimeoutSec 2 -UseBasicParsing
    if ($page.StatusCode -eq 200 -and $page.Content -match "<title>Arquitectura Adaptativa</title>") {
      $ready = $true
      break
    }
  } catch {
    Start-Sleep -Seconds 1
  }
}

if (-not $ready) {
  Write-Error "ARQ·EXAM no respondió en 90 segundos. Revisa la configuración y los mensajes del servidor."
  exit 1
}

Start-Process $localUrl
Write-Host "ARQ·EXAM está abierto en $localUrl. Mantén esta ventana abierta mientras uses la página."
$server.WaitForExit()
