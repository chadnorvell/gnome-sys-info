# Gnome Extension: System Information

Show CPU load average and memory usage in the status bar. CPU load average comes
straight from `uptime` (essentially the same load average information you see in
`top`). The memory statistic roughly represents the amount of RAM that is
currently in use and cannot be recovered, and is calcuated from `/proc/meminfo`
via `MemTotal - (MemFree + Buffers + Cached)`.

The refresh rate defaults to 5 seconds, but this can be modified by changing
`REFRESH_PERIOD` in `extension.js`.

## Changelog

### Version 1

Initial release.

