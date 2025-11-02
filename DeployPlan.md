Chắc chắn rồi. Đây là kế hoạch triển khai toàn diện và chuẩn xác nhất, bắt đầu từ một máy ảo trống trơn và một repository đã sẵn sàng trên GitHub. Kế hoạch này tối ưu hóa quy trình, tập trung vào việc thiết lập môi trường làm việc hiệu quả ngay từ đầu.

---

### **KẾ HOẠCH TRIỂN KHAI TOÀN DIỆN (TỪ VM TRỐNG)**

**Tình trạng ban đầu:**
*   **Trên GitHub:** Bạn đã có một repository với cấu trúc `source`, `server-configs`, các file `.gitignore` và `.gitkeep` đầy đủ.
*   **Trên máy tính cá nhân:** Bạn có một máy ảo (VM) trống, chưa cài hệ điều hành.

---

#### **Giai đoạn 1: Cài đặt Hệ điều hành và Thiết lập Truy cập Từ xa (SSH)**
*Mục tiêu: Xây dựng nền móng cho server và tạo ra một môi trường làm việc hiệu quả.*

**1.1. Cài đặt Ubuntu Server 24.04 LTS lên Máy ảo**
*   Khởi động VM từ file `.iso`.
*   Trong quá trình cài đặt:
    *   **Network:** Đảm bảo VM kết nối mạng (chế độ Bridged được khuyến khích).
    *   **Proxy:** Để trống.
    *   **Storage:** Dùng cài đặt mặc định (entire disk).
    *   **Profile Setup:** Tạo username và mật khẩu của bạn (ví dụ: `quan`).
    *   **SSH Setup:** **CHẮC CHẮN** chọn `[X] Install OpenSSH server`.
    *   **Featured Snaps:** **KHÔNG** chọn bất kỳ gói nào.
*   Hoàn tất cài đặt và khởi động lại máy ảo.

**1.2. Đăng nhập và Lấy địa chỉ IP**
*   Đăng nhập vào cửa sổ console của máy ảo bằng username và mật khẩu bạn vừa tạo.
*   Lấy địa chỉ IP của máy ảo bằng lệnh:
    ```bash
    ip a
    ```
*   Ghi lại địa chỉ IP này (ví dụ: `192.168.1.107`).

**1.3. Kết nối bằng SSH và Thoát khỏi Cửa sổ Máy ảo**
*   **Thu nhỏ cửa sổ máy ảo.** Từ giờ, mọi thao tác sẽ được thực hiện qua SSH trên terminal của máy tính thật.
*   Mở terminal trên máy thật và kết nối:
    ```bash
    ssh quan@<your_vm_ip>
    ```
*   Nhập mật khẩu của bạn để đăng nhập.

**=> Kết quả Giai đoạn 1:** Bạn đã có một server Ubuntu cơ bản và đang quản trị nó một cách chuyên nghiệp qua SSH.

---

#### **Giai đoạn 2: Cài đặt và Cấu hình các Dịch vụ Nền tảng**
*Mục tiêu: Cài đặt tất cả phần mềm cần thiết để chạy các ứng dụng web của bạn.*

**2.1. Cập nhật Hệ thống**
```bash
sudo apt update && sudo apt upgrade -y
```

**2.2. Cài đặt các Dịch vụ Chính (Nginx, BIND9)**
```bash
sudo apt install nginx bind9 bind9utils -y
sudo systemctl enable --now nginx
sudo systemctl enable --now bind9
```

**2.3. Cài đặt Môi trường Node.js và Công cụ Build**
```bash
# 1. Tải và chạy script cài đặt cho Node.js phiên bản 24
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -

# 2. Cài đặt Node.js
sudo apt-get install -y nodejs

# 3. (Khuyến khích) Cài đặt các công cụ build cần thiết
sudo apt-get install -y build-essential

# 4. Kiểm tra lại phiên bản để xác nhận thành công
node -v
npm -v
```

**2.4. Cài đặt Cơ sở dữ liệu MongoDB (Tương thích Ubuntu 24.04)**
```bash
sudo apt-get install gnupg curl -y
curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/8.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl enable --now mongod
```

**2.5. Cài đặt Trình quản lý Tiến trình PM2**
```bash
sudo npm install pm2 -g
```
**=> Kết quả Giai đoạn 2:** Server của bạn đã được trang bị đầy đủ "vũ khí" để sẵn sàng triển khai ứng dụng.

---

#### **Giai đoạn 3: Triển khai Mã nguồn và Chạy Ứng dụng**
*Mục tiêu: Lấy code từ GitHub về, cài đặt và cho chạy dưới dạng dịch vụ nền.*

**3.1. Clone Repository từ GitHub**```bash
# Tạo thư mục gốc và gán quyền
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www

# Clone repository của bạn
git clone <link-repo-github-cua-ban.git> /var/www/my-project
```

**3.2. Cài đặt Dependencies cho các Ứng dụng**
```bash
cd /var/www/my-project/source/blog-app && npm install
cd /var/www/my-project/source/ecommerce-app && npm install
```

**3.3. Chạy Ứng dụng bằng PM2**
```bash
# Chạy Blog App trên cổng 3000
pm2 start /var/www/my-project/source/blog-app/app.js --name blog-app -e "PORT=3000"

# Chạy E-Commerce App trên cổng 8080
pm2 start /var/www/my-project/source/ecommerce-app/app.js --name ecom-app -e "PORT=8080"

# Kiểm tra trạng thái online
pm2 list

# Lưu lại cấu hình để tự khởi động khi server reboot
pm2 save
```
**=> Kết quả Giai đoạn 3:** Cả hai ứng dụng của bạn hiện đang chạy ngầm trên server, sẵn sàng nhận kết nối nội bộ.

---

#### **Giai đoạn 4: Cấu hình Phân giải Tên miền và Điều hướng Truy cập**
*Mục tiêu: "Chỉ đường" cho thế giới bên ngoài biết cách truy cập vào hai ứng dụng của bạn.*

**4.1. Cấu hình Nginx (Reverse Proxy)**
*   Tạo file cấu hình cho `blog.com` tại `/etc/nginx/sites-available/blog.com` với nội dung trỏ đến `http://localhost:3000`.
*   Tạo file cấu hình cho `e-com.com` tại `/etc/nginx/sites-available/e-com.com` với nội dung trỏ đến `http://localhost:8080`.
*   Kích hoạt hai cấu hình này:
    ```bash
    sudo ln -s /etc/nginx/sites-available/blog.com /etc/nginx/sites-enabled/
    sudo ln -s /etc/nginx/sites-available/e-com.com /etc/nginx/sites-enabled/
    sudo nginx -t && sudo systemctl restart nginx
    ```

**4.2. Cấu hình BIND9 (DNS Server)**
*   Khai báo hai zones `blog.com` và `e-com.com` trong file `/etc/bind/named.conf.local`.
*   Tạo hai file zone tương ứng (`/etc/bind/zones/db.blog.com` và `db.e-com.com`), trỏ các bản ghi `A` về địa chỉ IP của máy ảo (`your_vm_ip`).
*   Kiểm tra và khởi động lại BIND9:
    ```bash
    sudo named-checkconf
    sudo named-checkzone blog.com /etc/bind/zones/db.blog.com
    sudo named-checkzone e-com.com /etc/bind/zones/db.e-com.com
    sudo systemctl restart bind9
    ```

---

#### **Giai đoạn 5: Kiểm tra và Quy trình Cập nhật**
*Mục tiêu: Xác nhận hệ thống hoạt động và nắm rõ quy trình cập nhật sau này.*

**5.1. Kiểm tra Hệ thống**
*   Trên máy tính thật, trỏ DNS về địa chỉ IP của máy ảo.
*   Mở trình duyệt và truy cập `http://blog.com` và `http://e-com.com`.

**5.2. Nắm vững Quy trình Cập nhật (Workflow)**
*   **Để sửa code:** Mở project trên **máy tính cá nhân**, sửa đổi, sau đó `git add`, `git commit`, và `git push`.
*   **Để cập nhật server:** **SSH vào server**, di chuyển tới thư mục `/var/www/my-project`, chạy `git pull`, sau đó dùng `pm2 restart <app-name>` để áp dụng thay đổi.

Kế hoạch này bao quát toàn bộ quy trình từ con số không đến một hệ thống hoàn chỉnh, đồng thời nhấn mạnh quy trình làm việc chuẩn giữa môi trường phát triển và triển khai.
