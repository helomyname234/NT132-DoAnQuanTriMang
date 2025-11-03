server {
    listen 80;
    server_name blog.com www.blog.com;

    location / {
        # Chuyển tiếp đến ứng dụng Blog đang chạy ở cổng 3000
        proxy_pass http://localhost:3000;

        # Các header quan trọng để chuyển tiếp thông tin gốc của người dùng
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
