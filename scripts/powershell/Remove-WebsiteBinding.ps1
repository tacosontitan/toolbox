param (
    [Parameter(Mandatory=$true)]
    [string] $WebsiteName,

    [Parameter(Mandatory=$true)]
    [string] $Protocol,

    [Parameter(Mandatory=$true)]
    [int] $Port,
	
	[Parameter(Mandatory=$false)]
    [string] $HostName = ""
)

$webAdministration = "WebAdministration"
if (-not (Get-Module -ListAvailable -Name webAdministration)) {
	Write-Host "Installing $($webAdministration)..." -NoNewline
	Install-Module -Name $webAdministration -Force -Scope CurrentUser -AllowClobber
	Write-Host " [Done]" -ForegroundColor Green
} else {
	Write-Host "Module $($webAdministration) is already installed." -ForegroundColor Cyan
}

Import-Module WebAdministration

$existingBinding = Get-WebBinding `
	-Name $WebsiteName `
	-Protocol $Protocol `
	-Port $Port `
	-HostHeader $HostName

if ($null -ne $existingBinding) {
    Remove-WebBinding `
		-Name $WebsiteName `
		-HostHeader $HostName `
		-Protocol $Protocol `
		-Port $Port
		
    Write-Output "Binding $($bindingInformation) with protocol $($Protocol) removed from site $($WebsiteName)."
} else {
    Write-Output "Binding $($bindingInformation) with protocol $($Protocol) does not exist on site $($WebsiteName)."
}