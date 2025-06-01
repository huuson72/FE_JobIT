
### Tổng Quan
JobIT là nền tảng tìm kiếm việc làm hiện đại kết nối người tìm việc với nhà tuyển dụng. Nền tảng cung cấp các tính năng cho cả người tìm việc và nhà tuyển dụng, với trọng tâm đặc biệt vào các gói đăng ký VIP để tăng khả năng hiển thị và tuyển dụng.

### Tính Năng Chính

#### Cho Người Tìm Việc
- Tìm kiếm việc làm nâng cao với nhiều bộ lọc
- Theo dõi đơn ứng tuyển
- Quản lý hồ sơ
- Tải lên và quản lý sơ yếu lý lịch
- Thông báo việc làm
- Đánh giá và xếp hạng công ty

#### Cho Nhà Tuyển Dụng
- Quản lý đăng tin tuyển dụng
- Sàng lọc và quản lý ứng viên
- Quản lý hồ sơ công ty
- Gói đăng ký VIP với các tính năng nâng cao:
  - Hiển thị ưu tiên tin tuyển dụng
  - Tin tuyển dụng nổi bật
  - Tăng giới hạn đăng tin
  - Thời hạn đăng ký kéo dài
  - Tùy chọn thương hiệu

### Gói Đăng Ký VIP
- **Gói Cơ Bản**: Tính năng tuyển dụng cơ bản
- **Gói Cao Cấp**: Khả năng hiển thị và đăng tin nâng cao
- **Gói Doanh Nghiệp**: Bộ công cụ tuyển dụng đầy đủ và hiển thị tối đa

### Công Nghệ Sử Dụng
- Frontend: React, TypeScript, Ant Design
- Backend: Spring Boot, Java
- Cơ sở dữ liệu: MySQL
- Tích hợp thanh toán: VNPay
- Xác thực: JWT

### Bắt Đầu

#### Yêu Cầu
- Node.js (v14 trở lên)
- Java JDK 11 trở lên
- MySQL 8.0 trở lên
- npm hoặc yarn

#### Cài Đặt
1. Clone repository
```bash
git clone https://github.com/your-username/jobit.git
```

2. Cài đặt dependencies frontend
```bash
cd frontend
npm install
```

3. Cài đặt dependencies backend
```bash
cd backend
./mvnw install
```

4. Cấu hình biến môi trường
```bash
# Frontend (.env)
VITE_BACKEND_URL=http://localhost:8080
VITE_VNPAY_RETURN_URL=http://localhost:3000/subscription/payment-result

# Backend (application.properties)
spring.datasource.url=jdbc:mysql://localhost:3306/jobit?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
```

5. Khởi động ứng dụng
```bash
# Frontend
npm run dev

# Backend
./mvnw spring-boot:run
```

### Đóng Góp
Vui lòng đọc [CONTRIBUTING.md](CONTRIBUTING.md) để biết thêm chi tiết về quy tắc ứng xử và quy trình gửi pull request.
