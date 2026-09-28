#include "crypto_wipe.h"
#include "utils.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/ioctl.h>
#ifdef __linux__
#include <linux/fs.h>
#endif
#include <openssl/evp.h>
#include <openssl/rand.h>

#define CHUNK_SIZE (4 * 1024 * 1024)  // 4MB chunks
#define AES_KEY_SIZE 32               // 256-bit key

// Simple crypto wipe implementation
int crypto_wipe_device(const char *device_path, char **log_output) {
    int fd = open(device_path, O_RDWR);
    if (fd < 0) {
        if (log_output) *log_output = strdup("Failed to open device");
        return -1;
    }

    // Get device size
    uint64_t dev_size;
    if (ioctl(fd, BLKGETSIZE64, &dev_size) < 0) {
        close(fd);
        if (log_output) *log_output = strdup("Failed to get device size");
        return -1;
    }

    printf("Starting cryptographic wipe on %s (%lu bytes)\n", device_path, dev_size);

    // Generate random key
    unsigned char key[AES_KEY_SIZE];
    if (RAND_bytes(key, AES_KEY_SIZE) != 1) {
        close(fd);
        if (log_output) *log_output = strdup("Failed to generate random key");
        return -1;
    }

    // Generate random IV
    unsigned char iv[16];
    if (RAND_bytes(iv, sizeof(iv)) != 1) {
        close(fd);
        if (log_output) *log_output = strdup("Failed to generate IV");
        return -1;
    }

    // Setup encryption context
    EVP_CIPHER_CTX *ctx = EVP_CIPHER_CTX_new();
    if (!ctx) {
        close(fd);
        if (log_output) *log_output = strdup("Failed to create cipher context");
        return -1;
    }

    if (EVP_EncryptInit_ex(ctx, EVP_aes_256_ctr(), NULL, key, iv) != 1) {
        EVP_CIPHER_CTX_free(ctx);
        close(fd);
        if (log_output) *log_output = strdup("Failed to initialize encryption");
        return -1;
    }

    // Allocate buffers
    unsigned char *plaintext = malloc(CHUNK_SIZE);
    unsigned char *ciphertext = malloc(CHUNK_SIZE);
    if (!plaintext || !ciphertext) {
        if (plaintext) free(plaintext);
        if (ciphertext) free(ciphertext);
        EVP_CIPHER_CTX_free(ctx);
        close(fd);
        if (log_output) *log_output = strdup("Memory allocation failed");
        return -1;
    }
    memset(plaintext, 0, CHUNK_SIZE);  // Zero-filled plaintext

    // Encrypt and write in chunks
    uint64_t written = 0;
    int success = 1;

    while (written < dev_size && success) {
        size_t chunk_size = (dev_size - written > CHUNK_SIZE) ? CHUNK_SIZE : (size_t)(dev_size - written);
        
        int out_len;
        if (EVP_EncryptUpdate(ctx, ciphertext, &out_len, plaintext, chunk_size) != 1) {
            success = 0;
            break;
        }

        ssize_t bytes_written = write(fd, ciphertext, out_len);
        if (bytes_written != out_len) {
            success = 0;
            break;
        }

        written += bytes_written;
        
        // Show progress
        if (written % (100 * 1024 * 1024) == 0) {  // Every 100MB
            double progress = (written * 100.0) / dev_size;
            printf("Progress: %.1f%% (%lu/%lu bytes)\n", progress, written, dev_size);
        }
    }

    // Cleanup
    EVP_CIPHER_CTX_free(ctx);
    free(plaintext);
    free(ciphertext);
    close(fd);

    // Securely wipe the key from memory
    explicit_bzero(key, sizeof(key));
    explicit_bzero(iv, sizeof(iv));

    if (success) {
        if (log_output) *log_output = strdup("Cryptographic wipe completed successfully");
        return 0;
    } else {
        if (log_output) *log_output = strdup("Cryptographic wipe failed during operation");
        return -1;
    }
}