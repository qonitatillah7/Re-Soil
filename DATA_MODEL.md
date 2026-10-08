# Model Data

Entitas inti (lihat juga halaman **Model Data** di aplikasi dan tombol *Unduh JSON demo*):

`Users` · `Sites` · `SiteMonitoring` · `FireHistory` · `PAHResults` · `PeatScanResults` · `Deployments` · `RESoilBatches` · `MicrobialConsortium` · `SeedBatches` · `GerminationMonitoring` · `VegetationMonitoring` · `EnvironmentalMonitoring` · `Reports` · `RiskAlerts` · `Recommendations` · `LaboratoryReports` · `Stakeholders` · `Activities`

## Relasi utama
- `Sites 1—N` SiteMonitoring, FireHistory, PAHResults, PeatScanResults, Deployments, GerminationMonitoring, VegetationMonitoring, EnvironmentalMonitoring, Reports, RiskAlerts, Recommendations, LaboratoryReports
- `Deployments N—1` RESoilBatches
- `RESoilBatches N—1` MicrobialConsortium, `N—1` SeedBatches
- `Reports N—1` Users (pelapor); `Activities N—1` Users
- `PAHResults` selalu berlabel **Laboratory Verified**; `PeatScanResults` hanya menyimpan kategori risiko, bukan konsentrasi.
