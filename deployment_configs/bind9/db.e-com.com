; BIND data file for e-com.com
$TTL    604800
@       IN      SOA     ns1.e-com.com. admin.e-com.com. (
                              3         ; Serial
                         604800         ; Refresh
                          86400         ; Retry
                        2419200         ; Expire
                         604800 )       ; Negative Cache TTL
;
; Name Servers
@       IN      NS      ns1.e-com.com.

; A Records for the domain
@       IN      A       192.168.1.174
www     IN      A       192.168.1.174
ns1     IN      A       192.168.1.174
