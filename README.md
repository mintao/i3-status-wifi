# i3-status-wifi

Show the wifi connection status of your network interface(s).

Based on [i3-status-starter](https://github.com/fehmer/i3-status-starter)

## Block usage:
```yml
blocks:
  - name: wifi
    module: i3-status-wifi
    interface: wlp61s0
    color: '#00aaDD'
    show: ['ssid', 'iface', 'security']
    interval: 1
```
