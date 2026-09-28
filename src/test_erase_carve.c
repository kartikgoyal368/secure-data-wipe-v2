#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <fcntl.h>
#include "file_erase.h"
#include "file_carve.h"

int main() {
    printf("--- Testing File Eraser ---\n");
    system("echo 'super secret confidential data' > test_secret.txt");
    printf("Created test_secret.txt. Erasing...\n");
    
    char *log = NULL;
    int res = secure_erase_file("test_secret.txt", ERASE_PASS_RANDOM, &log);
    printf("Erase result: %d\n", res);
    if (log) {
        printf("Erase Log: %s\n", log);
        free(log);
    }
    if (access("test_secret.txt", F_OK) == -1) {
        printf("Success: test_secret.txt no longer exists.\n");
    } else {
        printf("Failure: test_secret.txt still exists.\n");
    }
    
    printf("\n--- Testing File Carving ---\n");
    // Create a fake disk image
    int fd = open("fake_disk.img", O_WRONLY | O_CREAT | O_TRUNC, 0644);
    if (fd < 0) return 1;
    
    char dummy[1024];
    memset(dummy, 'A', sizeof(dummy));
    write(fd, dummy, sizeof(dummy));
    
    // Write a fake PDF signature
    write(fd, "\x25\x50\x44\x46\x2D", 5);
    write(fd, "Fake PDF Content Inside Here...", 31);
    write(fd, "\x25\x25\x45\x4F\x46", 5);
    
    memset(dummy, 'B', sizeof(dummy));
    write(fd, dummy, sizeof(dummy));
    
    // Write a fake JPG signature
    write(fd, "\xFF\xD8\xFF", 3);
    write(fd, "Fake JPG Data", 13);
    write(fd, "\xFF\xD9", 2);
    
    write(fd, dummy, 500);
    close(fd);
    
    printf("Created fake_disk.img with hidden PDF and JPG.\n");
    printf("Running carver...\n");
    
    res = carve_files("fake_disk.img", "carve_out", &log);
    printf("Carve result: %d files found.\n", res);
    if (log) {
        printf("Carve Log: %s\n", log);
        free(log);
    }
    
    system("ls -l carve_out");
    system("cat carve_out/recovered_0.pdf");
    printf("\n");
    
    return 0;
}
