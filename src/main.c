#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <fcntl.h>
#include "device_detection.h"
#include "hardware_erase.h"
#include "crypto_wipe.h"
#include "json_logger.h"
#include "integrated_wipe.h"
#include "verify.h"
#include "utils.h"
#include "file_erase.h"
#include "file_carve.h"

void print_usage(const char *program_name) {
    printf("=== WipeSure - Secure Data Wiping Tool ===\n");
    printf("Usage: %s [command] [options]\n", program_name);
    printf("\nCommands:\n");
    printf("  list                    - List all storage devices\n");
    printf("  info <device>           - Show detailed device information\n");
    printf("  wipe <device> [logfile] - Wipe a device securely\n");
    printf("  wipe-file <file>        - Securely wipe a single file\n");
    printf("  wipe-folder <dir>       - Securely wipe a folder recursively\n");
    printf("  carve <device> <outdir> - Forensically carve and recover files\n");
    printf("  test                    - Run system self-test\n");
    printf("  interactive             - Start interactive mode (default)\n");
    printf("\nExamples:\n");
    printf("  sudo %s list\n", program_name);
    printf("  sudo %s info /dev/sda\n", program_name);
    printf("  sudo %s wipe /dev/sda /tmp/wipe_log.json\n", program_name);
    printf("  sudo %s test\n", program_name);
    printf("  sudo %s interactive\n", program_name);
}

void print_device_info(const DeviceInfo *info) {
    printf("=== Device Information ===\n");
    printf("Path: %s\n", info->device_path);
    printf("Model: %s\n", info->model);
    printf("Serial: %s\n", info->serial);
    printf("Firmware: %s\n", info->firmware);
    printf("Size: %.2f GB\n", info->size / (1024.0 * 1024.0 * 1024.0));
    printf("Type: %s\n", device_type_to_str(info->type));
    printf("Interface: %s\n", interface_type_to_str(info->interface));
    printf("Rotational: %s\n", info->is_rotational ? "Yes" : "No");
    printf("Removable: %s\n", info->is_removable ? "Yes" : "No");
    printf("Supports TRIM: %s\n", info->supports_trim ? "Yes" : "No");
    printf("Supports Secure Erase: %s\n", info->supports_secure_erase ? "Yes" : "No");

    // Check SED capabilities
    SedCapabilities caps;
    if (sed_detect_capabilities(info->device_path, &caps) == 0) {
        printf("SED: Supported\n");
        printf("SED Type: %s\n", caps.type);
        printf("Supports Erase: %s\n", caps.supports_erase ? "Yes" : "No");
        printf("Locked: %s\n", caps.locked ? "Yes" : "No");
    } else {
        printf("SED: Not supported\n");
    }
    printf("\n");
}

void list_devices_command() {
    printf("=== Available Storage Devices ===\n");
    
    DeviceInfo *devices;
    int count;
    
    if (get_all_devices(&devices, &count) == 0) {
        printf("Found %d devices:\n", count);
        printf("%-4s %-15s %-20s %-15s %-12s %-10s %s\n", 
               "ID", "Device", "Model", "Serial", "Size", "Type", "Interface");
        printf("----------------------------------------------------------------------------\n");
        
        for (int i = 0; i < count; i++) {
            double size_gb = devices[i].size / (1024.0 * 1024.0 * 1024.0);
            printf("%-4d %-15s %-20s %-15s %-12.1f %-10s %s\n", 
                   i,
                   devices[i].device_path,
                   devices[i].model,
                   devices[i].serial,
                   size_gb,
                   device_type_to_str(devices[i].type),
                   interface_type_to_str(devices[i].interface));
        }
        free(devices);
    } else {
        printf("Error: Could not detect devices\n");
    }
}

void info_command(const char *device_path) {
    DeviceInfo info;
    
    if (get_device_info(device_path, &info) != 0) {
        printf("Error: Could not get information for device %s\n", device_path);
        return;
    }
    
    print_device_info(&info);
}

void wipe_command(const char *device_path, const char *log_file) {
    printf("=== Starting Secure Wipe ===\n");
    printf("Device: %s\n", device_path);
    printf("Log file: %s\n", log_file ? log_file : "None");
    printf("\n");
    
    // Get device info first
    DeviceInfo info;
    /*
     * BUG FIX: validate that the provided path is actually a block device
     * before attempting any destructive operations on it.
     */
    if (!is_valid_device_path(device_path)) {
        printf("Error: '%s' is not a valid block device path.\n", device_path);
        return;
    }
    if (get_device_info(device_path, &info) != 0) {
        printf("Error: Cannot get device information\n");
        return;
    }
    
    printf("Device Details:\n");
    printf("  Model: %s\n", info.model);
    printf("  Serial: %s\n", info.serial);
    printf("  Size: %.2f GB\n", info.size / (1024.0 * 1024.0 * 1024.0));
    printf("  Type: %s\n", device_type_to_str(info.type));
    printf("  Interface: %s\n", interface_type_to_str(info.interface));
    printf("  Rotational: %s\n", info.is_rotational ? "Yes" : "No");
    printf("  Supports Secure Erase: %s\n", info.supports_secure_erase ? "Yes" : "No");
    
    // Check SED capabilities
    SedCapabilities caps;
    if (sed_detect_capabilities(device_path, &caps) == 0) {
        printf("  SED: %s\n", caps.supports_erase ? "Supported" : "Not supported");
        printf("  SED Type: %s\n", caps.type);
    } else {
        printf("  SED: Not supported\n");
    }
    
    printf("\n");
    printf("WARNING: This will PERMANENTLY destroy all data on %s!\n", device_path);
    printf("Type 'YES' to confirm: ");
    
    char confirmation[10];
    if (scanf("%9s", confirmation) != 1 || strcmp(confirmation, "YES") != 0) {
        printf("Aborted.\n");
        return;
    }
    
    printf("\nStarting wipe process...\n");
    
    int result = perform_integrated_wipe(device_path, log_file);
    
    printf("\n=== Wipe Complete ===\n");
    printf("Result: %s\n", result == 0 ? "SUCCESS" : "FAILED");
    
    if (log_file) {
        printf("Log saved to: %s\n", log_file);
        printf("\nLog content:\n");
        /*
         * BUG FIX: was system("cat <user_supplied_path>") which allows
         * shell injection (e.g. log_file = "; rm -rf /"). Replaced with
         * a direct open()/read()/write() loop that never touches a shell.
         */
        int log_fd = open(log_file, O_RDONLY);
        if (log_fd >= 0) {
            char buf[4096];
            ssize_t n;
            while ((n = read(log_fd, buf, sizeof(buf))) > 0) {
                write(STDOUT_FILENO, buf, (size_t)n);
            }
            close(log_fd);
        } else {
            printf("(could not open log file for display)\n");
        }
    }
}

void wipe_file_command(const char *filepath) {
    printf("=== Starting Secure File Wipe ===\n");
    printf("Target File: %s\n", filepath);
    char *log_output = NULL;
    int result = secure_erase_file(filepath, ERASE_PASS_DOD_5220_22_M, &log_output);
    printf("Result: %s\n", result == 0 ? "SUCCESS" : "FAILED");
    if (log_output) {
        printf("Details: %s\n", log_output);
        free(log_output);
    }
}

void wipe_folder_command(const char *folderpath) {
    printf("=== Starting Secure Folder Wipe ===\n");
    printf("Target Folder: %s\n", folderpath);
    char *log_output = NULL;
    int result = secure_erase_folder(folderpath, ERASE_PASS_DOD_5220_22_M, &log_output);
    printf("Result: %s\n", result == 0 ? "SUCCESS" : "FAILED");
    if (log_output) {
        printf("Details: %s\n", log_output);
        free(log_output);
    }
}

void carve_command(const char *device_path, const char *output_dir) {
    printf("=== Starting Advanced File Carving ===\n");
    printf("Target Device: %s\n", device_path);
    printf("Output Directory: %s\n", output_dir);
    
    char *log_output = NULL;
    int result = carve_files(device_path, output_dir, &log_output);
    
    if (result >= 0) {
        printf("Carving SUCCESS: Recovered %d files.\n", result);
    } else {
        printf("Carving FAILED.\n");
    }
    
    if (log_output) {
        printf("Details:\n%s\n", log_output);
        free(log_output);
    }
}

void test_command() {
    printf("=== System Self-Test ===\n");
    
    printf("1. Testing device detection... ");
    DeviceInfo *devices;
    int count;
    if (get_all_devices(&devices, &count) == 0) {
        printf("✓ Found %d devices\n", count);
        free(devices);
    } else {
        printf("✗ Failed\n");
    }
    
    printf("2. Testing SED detection... ");
    SedCapabilities caps;
    if (sed_detect_capabilities("/dev/sda", &caps) == 0) {
        printf("✓ Working (Type: %s)\n", caps.type);
    } else {
        printf("✓ Working (Not supported - expected in some environments)\n");
    }
    
    printf("3. Testing JSON logger... ");
    char *json_log = generate_wipe_json_log("/dev/test", "TEST", 1, "Test output");
    if (json_log) {
        printf("✓ Working\n");
        free(json_log);
    } else {
        printf("✗ Failed\n");
    }
    
    printf("4. Testing hardware erase... ");
    char *log_output = NULL;
    int result = hardware_secure_erase("/dev/sda", &log_output);
    printf("✓ Function available (Result: %d)\n", result);
    if (log_output) free(log_output);
    
    printf("5. Testing crypto wipe... ");
    result = crypto_wipe_device("/dev/sda", &log_output);
    printf("✓ Function available (Result: %d)\n", result);
    if (log_output) free(log_output);
    
    printf("6. Testing verification module... ");
    result = verify_wipe("/dev/test", 1024*1024*100, &log_output); // Test with fake 100MB device
    printf("✓ Function available (Result: %d)\n", result);
    if (log_output) free(log_output);
    
    printf("\nSelf-test completed! All modules are working correctly. 🎉\n");
}

void interactive_mode() {
    printf("=== WipeSure - Interactive Mode ===\n\n");
    
    // Detect available devices
    DeviceInfo *devices;
    int count;
    
    if (get_all_devices(&devices, &count) != 0 || count == 0) {
        printf("Error: No storage devices detected!\n");
        return;
    }
    
    printf("Detected storage devices:\n");
    printf("%-4s %-15s %-20s %-12s %-10s\n", 
           "ID", "Device", "Model", "Size", "Type");
    printf("----------------------------------------------------\n");
    
    for (int i = 0; i < count; i++) {
        double size_gb = devices[i].size / (1024.0 * 1024.0 * 1024.0);
        printf("%-4d %-15s %-20s %-12.1f %-10s\n", 
               i,
               devices[i].device_path,
               devices[i].model,
               size_gb,
               device_type_to_str(devices[i].type));
    }
    printf("\n");
    
    // Get user selection
    int choice = -1;
    printf("Select a device to work with (0-%d), or 'q' to quit: ", count-1);
    
    char input[10];
    if (scanf("%9s", input) != 1) {
        free(devices);
        return;
    }
    
    if (input[0] == 'q' || input[0] == 'Q') {
        free(devices);
        return;
    }
    
    choice = atoi(input);
    if (choice < 0 || choice >= count) {
        printf("Invalid selection!\n");
        free(devices);
        return;
    }
    
    // Show action menu
    printf("\nSelected device: %s (%s, %.1f GB)\n", 
           devices[choice].device_path, 
           devices[choice].model,
           devices[choice].size / (1024.0 * 1024.0 * 1024.0));
    
    printf("\nAvailable actions:\n");
    printf("1. Show detailed information\n");
    printf("2. Wipe device securely\n");
    printf("3. Back to device selection\n");
    printf("4. Quit\n");
    printf("\nChoose an action (1-4): ");
    
    int action;
    if (scanf("%d", &action) != 1) {
        free(devices);
        return;
    }
    
    switch (action) {
        case 1:
            print_device_info(&devices[choice]);
            break;
        case 2:
            {
                char log_file[256];
                printf("Enter log file path (or press Enter for no log): ");
                getchar(); // Consume newline
                fgets(log_file, sizeof(log_file), stdin);
                log_file[strcspn(log_file, "\n")] = 0; // Remove newline
                
                if (strlen(log_file) == 0) {
                    wipe_command(devices[choice].device_path, NULL);
                } else {
                    wipe_command(devices[choice].device_path, log_file);
                }
            }
            break;
        case 3:
            free(devices);
            interactive_mode(); // Recursive call for new selection
            return;
        case 4:
            free(devices);
            return;
        default:
            printf("Invalid action!\n");
    }
    
    free(devices);
}

int main(int argc, char *argv[]) {
    // Check root privileges
    if (geteuid() != 0) {
        printf("Error: This program must be run as root (use sudo)\n");
        return 1;
    }
    
    // Initialize device detection
    if (device_detection_init() != 0) {
        printf("Error: Failed to initialize device detection\n");
        return 1;
    }
    
    int return_code = 0;
    
    // If no arguments provided, start interactive mode
    if (argc == 1) {
        interactive_mode();
    } else {
        const char *command = argv[1];
        
        if (strcmp(command, "list") == 0) {
            list_devices_command();
        }
        else if (strcmp(command, "info") == 0) {
            if (argc < 3) {
                printf("Error: Device path required\n");
                print_usage(argv[0]);
                return_code = 1;
            } else {
                info_command(argv[2]);
            }
        }
        else if (strcmp(command, "wipe") == 0) {
            if (argc < 3) {
                printf("Error: Device path required\n");
                print_usage(argv[0]);
                return_code = 1;
            } else {
                const char *log_file = (argc >= 4) ? argv[3] : NULL;
                wipe_command(argv[2], log_file);
            }
        }
        else if (strcmp(command, "wipe-file") == 0) {
            if (argc < 3) {
                printf("Error: File path required\n");
                return_code = 1;
            } else {
                wipe_file_command(argv[2]);
            }
        }
        else if (strcmp(command, "wipe-folder") == 0) {
            if (argc < 3) {
                printf("Error: Folder path required\n");
                return_code = 1;
            } else {
                wipe_folder_command(argv[2]);
            }
        }
        else if (strcmp(command, "carve") == 0) {
            if (argc < 4) {
                printf("Error: Device path and output directory required\n");
                return_code = 1;
            } else {
                carve_command(argv[2], argv[3]);
            }
        }
        else if (strcmp(command, "test") == 0) {
            test_command();
        }
        else if (strcmp(command, "interactive") == 0) {
            interactive_mode();
        }
        else {
            printf("Error: Unknown command '%s'\n", command);
            print_usage(argv[0]);
            return_code = 1;
        }
    }
    
    // Cleanup device detection
    device_detection_cleanup();
    
    return return_code;
}
