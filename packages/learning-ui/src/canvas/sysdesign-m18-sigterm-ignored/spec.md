# Canvas spec: sysdesign-m18-sigterm-ignored

- **Course and chapter:** system-design, 18.2 beat 5 (The signal nobody answers).
- **Renderer:** `scene` (data only).
- **Claim:** Without a SIGTERM handler, a container's main process does not stop when asked. It is killed at the end of the wait, with no chance to finish its requests.
- **Story:** Docker sends SIGTERM. The service says nothing and carries on. Docker waits ten seconds, then sends SIGKILL, and the service is gone.
- **Numbers:** docker stop -t 10 took 10.8 s and the container exited with 137 (course challenge 17 part 1, 2026-10-24).
- **Limits shown under the picture:** The wait in the picture is docker stop -t 10. The default wait depends on your Docker version (the Kubernetes default is 30 seconds). On Linux the kernel ignores a signal sent to process 1 unless the program installed a handler for it; the picture time is compressed.
- **Sources:** pid_namespaces(7): only signals with an installed handler reach process 1 [verified 2026-10-24, add to dossier]. Docker docs: docker stop sends SIGTERM, then SIGKILL after a grace period.
