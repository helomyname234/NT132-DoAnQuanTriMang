; BIND data file for blog.com
$TTL    604800
@       IN      SOA     ns1.blog.com. admin.blog.com. (
                              3         ; Serial (Tăng số này mỗi khi bạn sửa file)
                         604800         ; Refresh
                          86400         ; Retry
                        2419200         ; Expire
                         604800 )       ; Negative Cache TTL
;
; Name Servers
@       IN      NS      ns1.blog.com.

; A Records for the domain
@       IN      A       192.168.1.174
www     IN      A       192.168.1.174
ns1     IN      A       192.168.1.174
