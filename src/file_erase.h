#ifndef FILE_ERASE_H
#define FILE_ERASE_H

#include <stddef.h>

/* Defines erasure passes */
typedef enum {
    ERASE_PASS_ZERO = 1,
    ERASE_PASS_RANDOM = 2,
    ERASE_PASS_DOD_5220_22_M = 3  /* 3 passes: Zero, Ones, Random */
} ErasePasses;

/* 
 * Securely erase a single file by overwriting data, renaming to hide metadata, 
 * and unlinking.
 * Returns 0 on success, non-zero on failure.
 */
int secure_erase_file(const char *filepath, ErasePasses passes, char **log_output);

/*
 * Securely erase a folder and all its contents recursively.
 */
int secure_erase_folder(const char *folderpath, ErasePasses passes, char **log_output);

#endif
