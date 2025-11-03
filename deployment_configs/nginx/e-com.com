server {
    listen 80;
    server_name e-com.com www.e-com.com;

    location / {
        # Chuyển tiếp đến ứng dụng E-commerce đang chạy ở cổng 8080
        proxy_pass http://localhost:8080;

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
