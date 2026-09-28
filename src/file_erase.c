#define _GNU_SOURCE
#include "file_erase.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/stat.h>
#include <time.h>
#include <dirent.h>
#include <libgen.h>

#define ERASE_BUF_SIZE 4096

// Helper to rename file to random string to destroy metadata
static int obfuscate_filename(const char *filepath, char *new_filepath, size_t new_filepath_len) {
    char dir_buf[1024];
    strncpy(dir_buf, filepath, sizeof(dir_buf) - 1);
    char *dir = dirname(dir_buf);
    
    char random_name[32];
    srand(time(NULL) ^ getpid());
    for (int i = 0; i < 16; i++) {
        random_name[i] = 'a' + (rand() % 26);
    }
    random_name[16] = '\0';
    
    snprintf(new_filepath, new_filepath_len, "%s/%s", dir, random_name);
    return rename(filepath, new_filepath);
}

static int overwrite_file(int fd, off_t size, unsigned char pattern) {
    unsigned char buf[ERASE_BUF_SIZE];
    memset(buf, pattern, ERASE_BUF_SIZE);
    
    if (lseek(fd, 0, SEEK_SET) == (off_t)-1) return -1;
    
    off_t written = 0;
    while (written < size) {
        size_t to_write = (size - written < ERASE_BUF_SIZE) ? (size_t)(size - written) : ERASE_BUF_SIZE;
        ssize_t w = write(fd, buf, to_write);
        if (w <= 0) return -1;
        written += w;
    }
    fsync(fd);
    return 0;
}

static int overwrite_file_random(int fd, off_t size) {
    unsigned char buf[ERASE_BUF_SIZE];
    
    if (lseek(fd, 0, SEEK_SET) == (off_t)-1) return -1;
    
    int urandom = open("/dev/urandom", O_RDONLY);
    if (urandom < 0) return -1;
    
    off_t written = 0;
    while (written < size) {
        size_t to_write = (size - written < ERASE_BUF_SIZE) ? (size_t)(size - written) : ERASE_BUF_SIZE;
        read(urandom, buf, to_write); // fill with random
        ssize_t w = write(fd, buf, to_write);
        if (w <= 0) {
            close(urandom);
            return -1;
        }
        written += w;
    }
    close(urandom);
    fsync(fd);
    return 0;
}

int secure_erase_file(const char *filepath, ErasePasses passes, char **log_output) {
    struct stat st;
    if (stat(filepath, &st) != 0) {
        if (log_output) *log_output = strdup("File not found or cannot stat.");
        return -1;
    }
    
    if (!S_ISREG(st.st_mode)) {
        if (log_output) *log_output = strdup("Not a regular file.");
        return -1;
    }
    
    int fd = open(filepath, O_WRONLY);
    if (fd < 0) {
        if (log_output) *log_output = strdup("Permission denied opening file.");
        return -1;
    }
    
    int success = 0;
    
    switch(passes) {
        case ERASE_PASS_ZERO:
            success = overwrite_file(fd, st.st_size, 0x00);
            break;
        case ERASE_PASS_RANDOM:
            success = overwrite_file_random(fd, st.st_size);
            break;
        case ERASE_PASS_DOD_5220_22_M:
            // 3 passes: Zero, Ones, Random
            success = overwrite_file(fd, st.st_size, 0x00);
            if (success == 0) success = overwrite_file(fd, st.st_size, 0xFF);
            if (success == 0) success = overwrite_file_random(fd, st.st_size);
            break;
    }
    
    close(fd);
    
    if (success != 0) {
        if (log_output) *log_output = strdup("Failed to overwrite data.");
        return -1;
    }
    
    // Obfuscate filename to wipe MFT/inode metadata
    char new_path[1024];
    if (obfuscate_filename(filepath, new_path, sizeof(new_path)) == 0) {
        unlink(new_path);
    } else {
        unlink(filepath);
    }
    
    if (log_output) *log_output = strdup("File securely erased and metadata obfuscated.");
    return 0;
}

int secure_erase_folder(const char *folderpath, ErasePasses passes, char **log_output) {
    DIR *dir = opendir(folderpath);
    if (!dir) {
        if (log_output) *log_output = strdup("Failed to open directory.");
        return -1;
    }
    
    struct dirent *entry;
    char path[1024];
    
    while ((entry = readdir(dir)) != NULL) {
        if (strcmp(entry->d_name, ".") == 0 || strcmp(entry->d_name, "..") == 0) {
            continue;
        }
        
        snprintf(path, sizeof(path), "%s/%s", folderpath, entry->d_name);
        
        struct stat st;
        if (stat(path, &st) == 0) {
            if (S_ISDIR(st.st_mode)) {
                secure_erase_folder(path, passes, NULL);
            } else {
                secure_erase_file(path, passes, NULL);
            }
        }
    }
    
    closedir(dir);
    
    // Rename directory then delete
    char new_path[1024];
    if (obfuscate_filename(folderpath, new_path, sizeof(new_path)) == 0) {
        rmdir(new_path);
    } else {
        rmdir(folderpath);
    }
    
    if (log_output) *log_output = strdup("Folder and contents securely erased.");
    return 0;
}
