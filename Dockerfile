FROM mcr.microsoft.com/windows/servercore:ltsc2016

RUN powershell -ExecutionPolicy unrestricted -Command "Invoke-Expression ((New-Object Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))"
RUN choco install --confirm --limit-output --no-progress --ignore-checksums git nodejs yarn googlechrome opera windows-sdk-10.1
