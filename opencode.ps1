param (
    [string]$port = "3000"
)

Write-Host "Starting Art Royal V2 on port $port..."
# Using npx next dev directly to avoid argument parsing issues with npm run
npx next dev -p $port
