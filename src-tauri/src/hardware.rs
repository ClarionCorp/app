use sysinfo::{Disks, DiskKind, System};

#[derive(serde::Serialize)]
pub struct CpuInfo {
    brand: String,
    physical_cores: Option<usize>,
    logical_cores: usize,
}

#[derive(serde::Serialize)]
pub struct DiskInfo {
    mount_point: String,
    kind: String,
    total_space: u64,
}

#[derive(serde::Serialize)]
pub struct HardwareInfo {
    cpu: CpuInfo,
    os_drive: Option<DiskInfo>,
}

// Basic hardware info for bug reports (CPU model, whether the OS drive is an SSD)
#[tauri::command]
pub fn get_hardware_info() -> HardwareInfo {
    let mut sys = System::new_all();
    sys.refresh_cpu_all();

    let cpus = sys.cpus();
    let cpu = CpuInfo {
        brand: cpus.first().map(|c| c.brand().to_string()).unwrap_or_default(),
        physical_cores: System::physical_core_count(),
        logical_cores: cpus.len(),
    };

    let os_drive_path = if cfg!(windows) {
        std::env::var("SystemDrive").unwrap_or_else(|_| "C:".to_string())
    } else {
        "/".to_string()
    };

    let disks = Disks::new_with_refreshed_list();
    let os_drive = disks
        .list()
        .iter()
        .find(|d| {
            d.mount_point()
                .to_string_lossy()
                .to_uppercase()
                .starts_with(&os_drive_path.to_uppercase())
        })
        .or_else(|| disks.list().first())
        .map(|d| DiskInfo {
            mount_point: d.mount_point().to_string_lossy().to_string(),
            kind: match d.kind() {
                DiskKind::SSD => "SSD".to_string(),
                DiskKind::HDD => "HDD".to_string(),
                DiskKind::Unknown(_) => "Unknown".to_string(),
            },
            total_space: d.total_space(),
        });

    HardwareInfo { cpu, os_drive }
}
