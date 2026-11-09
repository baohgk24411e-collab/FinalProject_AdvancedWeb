# Tứ Quý Garden — Angular + Express + MongoDB

Ứng dụng dùng Angular cho catalog, bộ lọc và CRUD sản phẩm; các trang trình bày JS còn lại gọi cùng API qua Angular HttpClient. Backend dùng chung tại `my-app/api/app.js` cho local và Vercel.

## Cài đặt

Yêu cầu Node.js tương thích Angular 22 và MongoDB **replica set** (MongoDB Atlas hỗ trợ sẵn). Đặt hàng/hủy đơn dùng transaction; MongoDB standalone không đủ cho luồng này.

```powershell
cd D:\AdvancedWeb_FinalProject\my-app
npm ci
cd ..\my-server-mongodb
npm ci
Copy-Item .env.example .env
```

Mở `.env`, đặt `MONGODB_URI`, `DB_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` của bạn. Mật khẩu quản trị khởi tạo tối thiểu 12 ký tự. Không commit file `.env`, không dùng tài khoản test cho triển khai thật.

```powershell
# Từ my-server-mongodb
npm run seed
npm start
```

`seed` mới chỉ thêm sản phẩm/danh mục còn thiếu, hash mật khẩu legacy và tạo admin khi chưa có. Không xóa sản phẩm, tài khoản hay đơn hàng hiện có; không tạo đơn hàng hoặc khách hàng demo. Nếu đã có admin cùng email, script giữ nguyên tài khoản/mật khẩu đó. Hãy đổi các mật khẩu demo cũ bằng chức năng đổi mật khẩu sau khi đăng nhập. Index email/ID trùng sẽ làm setup dừng để tránh tự sửa nhầm dữ liệu; xử lý trùng trước khi chạy lại.

Mở terminal thứ hai:

```powershell
cd D:\AdvancedWeb_FinalProject\my-app
npm start
```

Truy cập `http://localhost:4200`. Proxy `/api` trỏ tới `http://localhost:3002`. GET `/api` trả trạng thái kết nối. Đăng nhập admin đã cấu hình để mở `/admin/products`.

## Các luồng đã nối database

- Products: GET/POST/PUT/DELETE, form Angular có mùa và mục tiêu sức khỏe, validation giá/kho, ID không đổi khi sửa.
- Categories: GET/POST/PUT/DELETE; không xóa danh mục đang có sản phẩm.
- Users: đăng ký, đăng nhập, hồ sơ, wishlist, đổi mật khẩu; admin xem/xóa khách hàng. Mật khẩu hash bằng scrypt; session cookie HttpOnly, SameSite; quyền kiểm tra tại server.
- Orders: đặt hàng, xem đơn theo tài khoản, chuyển trạng thái, hủy/hoàn kho, yêu cầu hoàn trả. Server đọc giá từ Products, tính voucher/phí và cập nhật tồn kho trong transaction; requestId chống tạo trùng khi retry.
- Vouchers: mã hệ thống và mã admin lưu MongoDB, dùng thống nhất khi thanh toán. Đổi điểm thưởng chưa mở.
- Không có API reset database; không chuyển lỗi ghi API thành thành công localStorage.

## Kiểm thử

Từ `my-app`:

```powershell
npm run test:api
npm test -- --watch=false
npm run build
npm audit
```

Test API dùng MongoDB replica set tạm riêng qua `mongodb-memory-server`, không dùng `.env` hay database thật. Lần chạy đầu có thể tải MongoDB binary. Các test bao gồm quyền truy cập, validation, CRUD, session, mật khẩu, voucher, tính tiền, transaction rollback, đặt hàng đồng thời, retry, và lỗi mạng trên giao diện. Test Angular kiểm tra cả radio filter được render thực sự bằng TestBed/DOM.

`npm run preview:test` mở bản build tại `http://127.0.0.1:4300` với database dùng riêng để kiểm tra UI, dữ liệu mất khi dừng. Tài khoản test chỉ trong preview: `admin@test.local` và `customer@test.local`, mật khẩu `Preview-test-123`. Không dùng script preview để hosting.

## Triển khai Vercel

- Root Directory: `my-app`.
- Build Command: `npm run build`; Output Directory: `dist/my-app`.
- Cấu hình biến môi trường `MONGODB_URI` và `DB_NAME` trên Vercel. MongoDB phải cho phép kết nối từ môi trường triển khai.
- Frontend và `/api` cùng origin; không cấu hình CORS mở cho mọi domain. Cookie dùng Secure khi `NODE_ENV=production`.
- Chạy setup CLI vào database đích sau khi kiểm tra cấu hình và sao lưu dữ liệu cần giữ.
- Thư mục `vercel_site` là bản tĩnh cũ, không phải bản Angular/API hiện hành.

## Việc cần cấu hình bên ngoài source

Mật khẩu Atlas từng được hardcode trong repository đã được gỡ khỏi source hiện tại, nhưng **phải đổi mật khẩu tài khoản database trên Atlas** vì lịch sử Git vẫn có thể chứa bản cũ. Chưa thay đổi tài khoản Atlas hoặc deploy trong lượt sửa code này.

Thanh toán online, Google/Facebook sign-in, gửi email/OTP và đổi điểm cần dịch vụ/khóa cấu hình riêng. Không có thông báo giả đã gửi email hoặc đăng nhập Google thành công. Đơn online hiện ghi nhận `paymentStatus=unpaid`; COD hoạt động ở mức đặt đơn, không tự xác nhận đã thu tiền. Không lưu thông tin thẻ thật vào demo.

Xem `CODE_REVIEW.md` cho phạm vi kiểm chứng và các giới hạn còn lại.
