#define _GNU_SOURCE
#include "file_carve.h"
#include "utils.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/stat.h>

#define CHUNK_SIZE (4 * 1024 * 1024) // 4MB buffer for scanning

// Magic bytes
static const unsigned char PDF_MAGIC[] = {0x25, 0x50, 0x44, 0x46, 0x2D}; // %PDF-
static const unsigned char PDF_EOF[] = {0x25, 0x25, 0x45, 0x4F, 0x46};   // %%EOF

static const unsigned char JPG_MAGIC[] = {0xFF, 0xD8, 0xFF};
static const unsigned char JPG_EOF[] = {0xFF, 0xD9};

static const unsigned char PNG_MAGIC[] = {0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A};
static const unsigned char PNG_EOF[] = {0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82}; // IEND block

static int memsearch(const unsigned char *haystack, size_t hlen, const unsigned char *needle, size_t nlen) {
    if (nlen == 0) return 0;
    if (hlen < nlen) return -1;
    
    for (size_t i = 0; i <= hlen - nlen; i++) {
        if (memcmp(haystack + i, needle, nlen) == 0) {
            return (int)i;
        }
    }
    return -1;
}

int carve_files(const char *device_path, const char *output_dir, char **log_output) {
    char output[2048] = {0};
    strncat(output, "Starting Advanced File Carving Engine...\n", sizeof(output) - 1);
    
    int fd = open(device_path, O_RDONLY);
    if (fd < 0) {
        if (log_output) *log_output = strdup("Failed to open device for carving.");
        return -1;
    }
    
    // Ensure output directory exists
    mkdir(output_dir, 0755);
    
    unsigned char *buffer = malloc(CHUNK_SIZE);
    if (!buffer) {
        close(fd);
        if (log_output) *log_output = strdup("Memory allocation failed.");
        return -1;
    }
    
    int carved_count = 0;
    off_t offset = 0;
    ssize_t bytes_read;
    
    // Very simple linear carving loop (for MVP hackathon demo)
    while ((bytes_read = read(fd, buffer, CHUNK_SIZE)) > 0) {
        // Look for PDF
        int pdf_start = memsearch(buffer, bytes_read, PDF_MAGIC, sizeof(PDF_MAGIC));
        if (pdf_start >= 0) {
            // Found a PDF, look for EOF
            int pdf_end = memsearch(buffer + pdf_start, bytes_read - pdf_start, PDF_EOF, sizeof(PDF_EOF));
            
            size_t file_size = 0;
            if (pdf_end > 0) {
                file_size = pdf_end + sizeof(PDF_EOF);
            } else {
                // Heuristic size if EOF not in this chunk
                file_size = (bytes_read - pdf_start > 1024 * 1024) ? 1024 * 1024 : bytes_read - pdf_start;
            }
            
            // Extract it
            char out_path[512];
            snprintf(out_path, sizeof(out_path), "%s/recovered_%d.pdf", output_dir, carved_count);
            int out_fd = open(out_path, O_WRONLY | O_CREAT | O_TRUNC, 0644);
            if (out_fd >= 0) {
                write(out_fd, buffer + pdf_start, file_size);
                close(out_fd);
                carved_count++;
                
                char log_msg[128];
                snprintf(log_msg, sizeof(log_msg), "Recovered PDF at offset %ld (Size: %zu bytes)\n", offset + pdf_start, file_size);
                strncat(output, log_msg, sizeof(output) - strlen(output) - 1);
            }
        }
        
        // Look for JPG
        int jpg_start = memsearch(buffer, bytes_read, JPG_MAGIC, sizeof(JPG_MAGIC));
        if (jpg_start >= 0) {
            int jpg_end = memsearch(buffer + jpg_start, bytes_read - jpg_start, JPG_EOF, sizeof(JPG_EOF));
            size_t file_size = 0;
            if (jpg_end > 0) {
                file_size = jpg_end + sizeof(JPG_EOF);
            } else {
                file_size = (bytes_read - jpg_start > 512 * 1024) ? 512 * 1024 : bytes_read - jpg_start;
            }
            
            char out_path[512];
            snprintf(out_path, sizeof(out_path), "%s/recovered_%d.jpg", output_dir, carved_count);
            int out_fd = open(out_path, O_WRONLY | O_CREAT | O_TRUNC, 0644);
            if (out_fd >= 0) {
                write(out_fd, buffer + jpg_start, file_size);
                close(out_fd);
                carved_count++;
                
                char log_msg[128];
                snprintf(log_msg, sizeof(log_msg), "Recovered JPG at offset %ld (Size: %zu bytes)\n", offset + jpg_start, file_size);
                strncat(output, log_msg, sizeof(output) - strlen(output) - 1);
            }
        }
        
        // Advance offset
        offset += bytes_read;
    }
    
    free(buffer);
    close(fd);
    
    char final_msg[128];
    snprintf(final_msg, sizeof(final_msg), "Carving complete. Total files recovered: %d\n", carved_count);
    strncat(output, final_msg, sizeof(output) - strlen(output) - 1);
    
    if (log_output) *log_output = strdup(output);
    
    return carved_count;
}
