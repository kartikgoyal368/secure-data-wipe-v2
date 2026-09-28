#include "device_detection.h"
#include "utils.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <dirent.h>
#include <fcntl.h>
#include <unistd.h>
#include <sys/stat.h> 

// Linux-specific headers for device size detection
#ifdef __linux__
#include <sys/ioctl.h>
#ifdef __linux__
#include <linux/fs.h>
#endif
#include <sys/sysmacros.h>
#endif

const char* device_type_to_str(DeviceType type) {
    switch (type) {
        case DEVICE_TYPE_HDD: return "HDD";
        case DEVICE_TYPE_SSD: return "SSD";
        case DEVICE_TYPE_NVME: return "NVMe SSD";
        case DEVICE_TYPE_USB: return "USB Storage";
        default: return "Unknown";
    }
}

const char* interface_type_to_str(InterfaceType type) {
    switch (type) {
        case INTERFACE_SATA: return "SATA";
        case INTERFACE_NVME: return "NVMe";
        case INTERFACE_USB: return "USB";
        case INTERFACE_SCSI: return "SCSI";
        default: return "Unknown";
    }
}

int device_detection_init() {
    // Initialize any required resources
    return 0;
}

void device_detection_cleanup() {
    // Cleanup any resources
}

// Device size detection function
uint64_t get_device_size(const char *device_path) {
    #ifdef __linux__
    int fd = open(device_path, O_RDONLY);
    if (fd < 0) {
        return 0;
    }
    
    uint64_t size = 0;
    if (ioctl(fd, BLKGETSIZE64, &size) < 0) {
        close(fd);
        return 0;
    }
    
    close(fd);
    return size;
    #else
    // Fallback for non-Linux systems
    return 0;
    #endif
}

// Get device model from sysfs
int get_device_model(const char *device_path, char *model, size_t model_size) {
    char sysfs_path[512];
    struct stat st;
    
    if (stat(device_path, &st) < 0) {
        return -1;
    }
    
    snprintf(sysfs_path, sizeof(sysfs_path), 
             "/sys/dev/block/%d:%d/device/model",
             major(st.st_rdev), minor(st.st_rdev));
    
    FILE *f = fopen(sysfs_path, "r");
    if (f) {
        if (fgets(model, model_size, f)) {
            // Remove trailing newline
            model[strcspn(model, "\n")] = '\0';
            fclose(f);
            return 0;
        }
        fclose(f);
    }
    
    return -1;
}

// Get device serial from sysfs
int get_device_serial(const char *device_path, char *serial, size_t serial_size) {
    char sysfs_path[512];
    struct stat st;
    
    if (stat(device_path, &st) < 0) {
        return -1;
    }
    
    snprintf(sysfs_path, sizeof(sysfs_path), 
             "/sys/dev/block/%d:%d/device/serial",
             major(st.st_rdev), minor(st.st_rdev));
    
    FILE *f = fopen(sysfs_path, "r");
    if (f) {
        if (fgets(serial, serial_size, f)) {
            // Remove trailing newline
            serial[strcspn(serial, "\n")] = '\0';
            fclose(f);
            return 0;
        }
        fclose(f);
    }
    
    return -1;
}

// Check if device is rotational (HDD) or not (SSD)
int get_device_rotational(const char *device_path) {
    char sysfs_path[512];
    struct stat st;
    char rotational[2] = {0};
    
    if (stat(device_path, &st) < 0) {
        return -1;
    }
    
    snprintf(sysfs_path, sizeof(sysfs_path), 
             "/sys/dev/block/%d:%d/queue/rotational",
             major(st.st_rdev), minor(st.st_rdev));
    
    FILE *f = fopen(sysfs_path, "r");
    if (f) {
        if (fgets(rotational, sizeof(rotational), f)) {
            fclose(f);
            return atoi(rotational);
        }
        fclose(f);
    }
    
    return -1;
}

int get_all_devices(DeviceInfo **devices, int *count) {
    DIR *dir;
    struct dirent *entry;
    DeviceInfo *dev_list = NULL;
    int dev_count = 0;
    int capacity = 10;
    
    dev_list = malloc(capacity * sizeof(DeviceInfo));
    if (!dev_list) return -1;
    
    dir = opendir("/sys/block");
    if (!dir) {
        free(dev_list);
        return -1;
    }
    
    while ((entry = readdir(dir)) != NULL) {
        if (entry->d_name[0] == '.') continue;
        
        // Skip virtual devices
        if (strstr(entry->d_name, "loop") || strstr(entry->d_name, "ram") || 
            strstr(entry->d_name, "fd") || strstr(entry->d_name, "dm-")) {
            continue;
        }
        
        if (dev_count >= capacity) {
            capacity *= 2;
            DeviceInfo *temp = realloc(dev_list, capacity * sizeof(DeviceInfo));
            if (!temp) {
                free(dev_list);
                closedir(dir);
                return -1;
            }
            dev_list = temp;
        }
        
        // Create device path
        snprintf(dev_list[dev_count].device_path, sizeof(dev_list[dev_count].device_path), 
                 "/dev/%s", entry->d_name);
        
        // Get device size
        dev_list[dev_count].size = get_device_size(dev_list[dev_count].device_path);
        
        // Get device model and serial
        get_device_model(dev_list[dev_count].device_path, 
                        dev_list[dev_count].model, 
                        sizeof(dev_list[dev_count].model));
        
        get_device_serial(dev_list[dev_count].device_path, 
                         dev_list[dev_count].serial, 
                         sizeof(dev_list[dev_count].serial));
        
        // Get rotational information
        int rotational = get_device_rotational(dev_list[dev_count].device_path);
        dev_list[dev_count].is_rotational = (rotational == 1);
        
        // Set default values
        strcpy(dev_list[dev_count].firmware, "Unknown");
        dev_list[dev_count].is_removable = 0;
        dev_list[dev_count].supports_trim = 0;
        dev_list[dev_count].supports_secure_erase = 0;
        
        // Detect device type and interface
        if (strstr(entry->d_name, "nvme")) {
            dev_list[dev_count].type = DEVICE_TYPE_NVME;
            dev_list[dev_count].interface = INTERFACE_NVME;
            dev_list[dev_count].is_rotational = 0;
        } else if (strstr(entry->d_name, "sd") || strstr(entry->d_name, "hd")) {
            dev_list[dev_count].interface = INTERFACE_SATA;
            dev_list[dev_count].type = dev_list[dev_count].is_rotational ? 
                                      DEVICE_TYPE_HDD : DEVICE_TYPE_SSD;
        } else if (strstr(entry->d_name, "mmcblk")) {
            dev_list[dev_count].type = DEVICE_TYPE_USB;
            dev_list[dev_count].interface = INTERFACE_USB;
            dev_list[dev_count].is_rotational = 0;
        } else {
            dev_list[dev_count].type = DEVICE_TYPE_UNKNOWN;
            dev_list[dev_count].interface = INTERFACE_UNKNOWN;
        }
        
        dev_count++;
    }
    
    closedir(dir);
    
    *devices = dev_list;
    *count = dev_count;
    return 0;
}

int get_device_info(const char *device_path, DeviceInfo *info) {
    const char *dev_name = strrchr(device_path, '/');
    if (!dev_name) return -1;
    dev_name++; // Skip the '/'
    
    memset(info, 0, sizeof(DeviceInfo));
    strncpy(info->device_path, device_path, sizeof(info->device_path) - 1);
    
    // Get device information
    info->size = get_device_size(device_path);
    get_device_model(device_path, info->model, sizeof(info->model));
    get_device_serial(device_path, info->serial, sizeof(info->serial));
    
    int rotational = get_device_rotational(device_path);
    info->is_rotational = (rotational == 1);
    
    // Set device type and interface
    if (strstr(dev_name, "nvme")) {
        info->type = DEVICE_TYPE_NVME;
        info->interface = INTERFACE_NVME;
        info->is_rotational = 0;
    } else if (strstr(dev_name, "sd") || strstr(dev_name, "hd")) {
        info->interface = INTERFACE_SATA;
        info->type = info->is_rotational ? DEVICE_TYPE_HDD : DEVICE_TYPE_SSD;
    } else if (strstr(dev_name, "mmcblk")) {
        info->type = DEVICE_TYPE_USB;
        info->interface = INTERFACE_USB;
        info->is_rotational = 0;
    } else {
        info->type = DEVICE_TYPE_UNKNOWN;
        info->interface = INTERFACE_UNKNOWN;
    }
    
    return 0;
}

/*
 * sed_detect_capabilities:
 *   BUG FIX: was a stub that always returned -1, making the SED erase code
 *   path permanently unreachable regardless of the drive's actual capabilities.
 *
 *   Now performs real detection:
 *   1. Try sedutil-cli (most reliable for TCG/OPAL 1.0 & 2.0 drives).
 *   2. Fall back to parsing hdparm -I output for TCG/SED/OPAL/Pyrite keywords.
 */
int sed_detect_capabilities(const char *device_path, SedCapabilities *caps) {
    if (!device_path || !caps) return -1;

    memset(caps, 0, sizeof(SedCapabilities));
    strcpy(caps->type, "UNKNOWN");
    caps->supports_erase = 0;
    caps->locked = 0;

    char cmd[256];
    char output[2048] = {0};

    /* --- Method 1: sedutil-cli --- */
    if (access("/usr/sbin/sedutil-cli", X_OK) == 0 ||
        access("/usr/local/sbin/sedutil-cli", X_OK) == 0) {
        snprintf(cmd, sizeof(cmd),
                 "sedutil-cli --scan 2>/dev/null | grep -i \"%s\" | head -1",
                 device_path);
        if (execute_command(cmd, output, sizeof(output)) == 0 && strlen(output) > 2) {
            /* sedutil-cli line format: /dev/sda  2  Samsung SSD ... */
            /* Field 2 == OPAL version (1 or 2 means supported) */
            if (strstr(output, "  1 ") || strstr(output, "  2 ")) {
                caps->supports_erase = 1;

                if (strstr(output, "  2 ")) {
                    strcpy(caps->type, "OPAL2");
                } else {
                    strcpy(caps->type, "OPAL1");
                }

                /* Check locked state */
                snprintf(cmd, sizeof(cmd),
                         "sedutil-cli --query %s 2>/dev/null | grep -i locked | head -1",
                         device_path);
                char locked_out[256] = {0};
                execute_command(cmd, locked_out, sizeof(locked_out));
                if (strstr(locked_out, "Y") || strstr(locked_out, "yes")) {
                    caps->locked = 1;
                }
                return 0;
            }
        }
    }

    /* --- Method 2: hdparm -I keyword scan --- */
    snprintf(cmd, sizeof(cmd), "hdparm -I %s 2>/dev/null", device_path);
    memset(output, 0, sizeof(output));
    if (execute_command(cmd, output, sizeof(output)) != 0 || strlen(output) < 10) {
        return -1; // hdparm not available or device not ATA
    }

    /* Check for TCG/SED/OPAL/Pyrite support in hdparm -I output */
    int found = 0;

    if (strstr(output, "Trusted Computing") || strstr(output, "TCG")) {
        found = 1;
        caps->supports_erase = 1;

        if (strstr(output, "OPAL") || strstr(output, "Opal")) {
            strcpy(caps->type, "OPAL");
        } else if (strstr(output, "Pyrite") || strstr(output, "PYRITE")) {
            strcpy(caps->type, "PYRITE");
        } else if (strstr(output, "Ruby") || strstr(output, "RUBY")) {
            strcpy(caps->type, "RUBY");
        } else {
            strcpy(caps->type, "TCG");
        }
    } else if (strstr(output, "Security Mode feature set")) {
        /* ATA Security — not full TCG/SED but supports ATA secure erase */
        found = 1;
        caps->supports_erase = 1;
        strcpy(caps->type, "ATA_SECURITY");
    }

    if (found) {
        /* Check locked: hdparm -I reports "enabled" / "locked" under Security */
        if (strstr(output, "\tlocked")) {
            caps->locked = 1;
        }
        return 0;
    }

    return -1; // No SED/TCG capability detected
}

const char *sed_type_to_str(const char *type) {
    if (strcmp(type, "OPAL") == 0 || strcmp(type, "OPAL1") == 0) return "Opal 1.0";
    if (strcmp(type, "OPAL2") == 0) return "Opal 2.0";
    if (strcmp(type, "PYRITE") == 0) return "Pyrite";
    if (strcmp(type, "RUBY") == 0) return "Ruby";
    if (strcmp(type, "TCG") == 0) return "TCG Generic";
    if (strcmp(type, "ATA_SECURITY") == 0) return "ATA Security";
    return type;
}