#ifndef FILE_CARVE_H
#define FILE_CARVE_H

#include <stdint.h>
#include <stddef.h>

/* Supported signature types for carving */
typedef enum {
    CARVE_PDF,
    CARVE_JPG,
    CARVE_PNG
} CarveFileType;

/*
 * Advanced file carving:
 * Scans a raw block device or disk image for file signatures
 * and extracts them to the specified output directory.
 * 
 * Returns the number of files successfully carved, or -1 on error.
 */
int carve_files(const char *device_path, const char *output_dir, char **log_output);

#endif
