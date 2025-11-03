Chắc chắn rồi! Bạn đã đi qua một hành trình gỡ lỗi rất thực tế và rút ra được nhiều kinh nghiệm quý giá. Việc tắt DNS IPv6 là một "mẹo" rất hữu ích khi làm việc trong môi trường lab cục bộ.

Dưới đây là một bản kế hoạch triển khai hoàn chỉnh cuối cùng, tổng hợp tất cả kinh nghiệm và cấu hình chuẩn xác mà chúng ta đã thống nhất.

---

### **KẾ HOẠCH TRIỂN KHAI HOÀN CHỈNH (PHIÊN BẢN CUỐI CÙNG)**

**Tình trạng ban đầu:**
*   **Trên GitHub:** Một repository đã sẵn sàng với cấu trúc thư mục chuẩn.
*   **Trên máy tính cá nhân:** Một máy ảo (VM) trống, sẵn sàng để cài đặt.

---

#### **Giai đoạn 1: Cài đặt và Bảo mật Truy cập Server**

1.  **Cài đặt Ubuntu Server 24.04 LTS lên VM:**
    *   Trong quá trình cài đặt, thực hiện các lựa chọn sau:
        *   Tạo username/password.
        *   **[X] Install OpenSSH server.**
        *   Để trống Proxy, không cài thêm Snap.

2.  **Lấy IP và Kết nối SSH:**
    *   Đăng nhập vào console VM, dùng `ip a` để lấy địa chỉ IP (ví dụ: `192.168.1.174`).
    *   Thu nhỏ cửa sổ VM. Từ bây giờ, mọi thao tác đều thực hiện qua SSH từ terminal trên máy tính thật: `ssh your_user@your_vm_ip`.

---

#### **Giai đoạn 2: Cài đặt Toàn bộ Môi trường Nền tảng**

*   Sao chép (copy) và dán (paste) **toàn bộ khối lệnh** sau vào terminal SSH của bạn. Nó sẽ tự động thực hiện tất cả các bước cài đặt.

    ```bash
    # === CẬP NHẬT HỆ THỐNG ===
    sudo apt update && sudo apt upgrade -y

    # === CÀI ĐẶT CÁC DỊCH VỤ CHÍNH ===
    sudo apt install nginx bind9 bind9utils -y
    sudo systemctl enable --now nginx
    sudo systemctl enable --now bind9

    # === CÀI ĐẶT NODE.JS v24 ===
    curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
    sudo apt-get install -y nodejs build-essential

    # === CÀI ĐẶT MONGODB v8.0 ===
    sudo apt-get install gnupg curl -y
    curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg --dearmor
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/8.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list
    sudo apt-get update
    sudo apt-get install -y mongodb-org
    sudo systemctl enable --now mongod

    # === CÀI ĐẶT PM2 ===
    sudo npm install pm2 -g
    ```

---

#### **Giai đoạn 3: Triển khai và Cấu hình Ứng dụng**

1.  **Clone Repository từ GitHub:**
    ```bash
    sudo mkdir -p /var/www && sudo chown -R $USER:$USER /var/www
    git clone <link-repo-github-cua-ban.git> /var/www/my-project
    ```

2.  **Cài đặt Dependencies:**
    ```bash
    cd /var/www/my-project/source/blog-app && npm install
    cd /var/www/my-project/source/ecommerce-app && npm install
    ```

3.  **Tạo file `.env` cho `blog-app` (chạy cổng 3000):**
    ```bash
    nano /var/www/my-project/source/blog-app/.env
    ```
    *   *Nội dung:*
        ```env
        MONGO_URL=mongodb://localhost:27017/blogify
        PORT=3000
        ```

4.  **Tạo file `.env` cho `ecommerce-app` (chạy cổng 8080):**
    ```bash
    nano /var/www/my-project/source/ecommerce-app/.env
    ```
    *   *Nội dung:*
        ```env
        DB_URI=mongodb://localhost:27017/ecommerce
        PORT=8080
        ```

5.  **Chạy Ứng dụng và Thiết lập PM2 Startup Script:**
    ```bash
    # Khởi động các ứng dụng
    pm2 start /var/www/my-project/source/blog-app/app.js --name blog-app
    pm2 start /var/www/my-project/source/ecommerce-app/main.js --name ecommerce-app

    # Lưu lại danh sách
    pm2 save

    # Tạo script khởi động cùng hệ thống (Làm theo hướng dẫn trên màn hình)
    pm2 startup
    ```

---

#### **Giai đoạn 4: Cấu hình Nginx và BIND9**

1.  **Cấu hình Nginx:**
    *   Tạo file `/etc/nginx/sites-available/blog.com` với `proxy_pass http://localhost:3000;`.
    *   Tạo file `/etc/nginx/sites-available/e-com.com` với `proxy_pass http://localhost:8080;`.
    *   *Lưu ý: Nhớ thêm đầy đủ các header `proxy_set_header` như đã thảo luận.*
    *   Kích hoạt cấu hình:
        ```bash
        sudo rm /etc/nginx/sites-enabled/default
        sudo ln -s /etc/nginx/sites-available/blog.com /etc/nginx/sites-enabled/
        sudo ln -s /etc/nginx/sites-available/e-com.com /etc/nginx/sites-enabled/
        sudo nginx -t && sudo systemctl restart nginx
        ```

2.  **Cấu hình BIND9 (với Forwarding):**
    *   Mở file `/etc/bind/named.conf.options` và thêm vào khối `options`:
        ```bind
        allow-query { any; };
        recursion yes;
        forwarders { 8.8.8.8; 8.8.4.4; };
        forward first;
        ```
    *   Mở file `/etc/bind/named.conf.local` và khai báo 2 zones `blog.com` và `e-com.com`.
    *   Tạo 2 file zone tương ứng trong `/etc/bind/zones/`, trỏ các bản ghi `A` về địa chỉ IP của máy ảo (`your_vm_ip`).
    *   Kiểm tra và khởi động lại BIND9:
        ```bash
        sudo named-checkconf && sudo systemctl restart bind9
        ```

---

#### **Giai đoạn 5: Cấu hình Client và Kiểm tra Toàn diện**

1.  **Cấu hình DNS trên Máy tính thật:**
    *   Mở cài đặt mạng.
    *   Vào tab **IPv4**, tắt DNS Automatic và nhập vào **chỉ địa chỉ IP của máy ảo**.
    *   Vào tab **IPv6** và chọn **"Disable"**.
    *   Áp dụng và ngắt/kết nối lại mạng.

2.  **Kiểm tra:**
    *   Mở terminal trên máy thật, dùng `traceroute blog.com` và `traceroute google.com` để xác nhận đường đi đã đúng. "Hop" đầu tiên phải là IP của máy ảo.
    *   Mở trình duyệt (cửa sổ ẩn danh), truy cập `http://blog.com`, `http://e-com.com`, và `https://google.com` để xác nhận mọi thứ hoạt động.

Kế hoạch này bao quát từ A-Z, bao gồm cả các "mẹo" gỡ lỗi quan trọng mà bạn đã khám phá ra. Chúc bạn thực hiện thành công
