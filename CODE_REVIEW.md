# Kết quả hoàn thiện — 09/11/2026

## Đã xử lý

- Hợp nhất ba entrypoint backend về `my-app/api/app.js`; gỡ URI/mật khẩu Atlas hardcode.
- Session lưu MongoDB, cookie HttpOnly/SameSite/Secure ở production; hash scrypt; giới hạn thử đăng nhập; kiểm tra quyền và sở hữu đơn hàng phía server; chặn request ghi thiếu custom header.
- API whitelist dữ liệu ghi, validation số/giá/kho/mùa/mục tiêu, index unique, database validator, counter ID sản phẩm; không cho sửa ID bằng request body.
- Catalog Angular standalone dùng binding, query params, filter nhiều điều kiện, sort, reset, lỗi tải/retry; không dùng mock để che lỗi API. Đã sửa lỗi default search khi thay query params qua test hồi quy.
- Admin sản phẩm dùng form Angular và ProductService/HttpClient, thêm/sửa/xóa chờ server; form giữ dữ liệu nếu lưu thất bại. Có season và healthGoals.
- Các luồng JS login/profile/wishlist/admin orders/checkout gọi cùng API; Angular HttpClient làm cầu nối. Có route guard và server authorization độc lập.
- Sửa lỗi cú pháp có sẵn trong common.js làm toàn bộ script dùng chung không chạy; thêm test parse toàn bộ public JS và khởi tạo modal/toast.
- Bỏ đăng nhập tự động bằng tài khoản mẫu và nạp đơn mẫu khi mở hồ sơ. Bỏ lưu danh sách mật khẩu ở các asset public.
- Đơn hàng được tính tiền lại, kiểm tra/trừ kho bằng MongoDB transaction; retry dùng cùng requestId; hủy đơn hoàn kho đúng một lần; phân quyền và kiểm tra chuyển trạng thái.
- Danh mục và voucher quản trị đã nối MongoDB; mã giảm giá được server xác minh lại lúc đặt hàng.
- Seed chuyển thành setup không xóa dữ liệu, không tạo đơn/users mẫu; thêm migration hash mật khẩu legacy. Đổi mật khẩu thu hồi các phiên khác.
- Nâng các package Angular đồng bộ và cập nhật lockfile; npm audit không còn lỗ hổng ở lần kiểm tra này.

## Database

`TuQuyGardenDB` với Products, Categories, Users, Orders; bổ sung Sessions (TTL), LoginAttempts (TTL), Counters và Vouchers. Mặc định 71 sản phẩm seed: 13 mùa hè, 7 mùa đông, 51 quanh năm. Đây là số trong file seed, không phải khẳng định số bản ghi Atlas hiện tại.

Backend yêu cầu replica set để bảo đảm transaction. Không giả lập thành công nếu database mất kết nối hoặc không hỗ trợ transaction. Source không tự kết nối Atlas bằng mật khẩu mặc định.

## Kiểm chứng

Kết quả: 18 test API/DOM + 6 test Angular đạt (24 tổng cộng); build production thành công; npm audit: 0 vulnerabilities.

- Kiểm thử tích hợp bằng MongoDB engine thật chạy tạm riêng, qua HTTP Express: CRUD, phân quyền, validation, email trùng, đổi mật khẩu/session, danh mục, voucher, chống sửa giá, idempotency, rollback và không oversell.
- Test DOM service: bỏ qua admin giả trong localStorage, lỗi checkout giữ giỏ/retry key, lỗi cập nhật trạng thái giữ cache cũ.
- Test Angular: kết hợp bộ lọc, sort/reset, thay query params, lỗi API, form giữ draft khi lưu lỗi, ID do server sinh, DOM thực của radio Summer.
- Test legacy catalog vẫn giữ để bảo vệ đường dẫn script dự phòng.
- Build production đã chạy thành công. Không kiểm chứng bằng trình duyệt thật: quyền mở localhost trong công cụ browser bị từ chối. Không deploy hoặc ghi vào database Atlas hiện có.

## Giới hạn / cấu hình ngoài dự án

- Chủ tài khoản cần đổi credential Atlas đã lộ trong lịch sử Git, cập nhật MONGODB_URI và chạy setup cho database đích. Không thể coi việc xóa chuỗi khỏi source là đã thu hồi credential cũ.
- Không phải toàn bộ trang JS đã được viết lại thành Angular template. Catalog/CRUD sản phẩm là Angular native; các trang trình bày còn lại dùng adapter API qua HttpClient. Cần rubric môn học để đối chiếu mức độ Angular yêu cầu trên từng trang.
- Email/OTP, Google/Facebook, cổng thanh toán và điểm thưởng chưa có dịch vụ thật. Đã bỏ các đường báo thành công giả; đơn online để unpaid. COD/CRUD/đặt hàng database được triển khai và kiểm thử, không đồng nghĩa đã tích hợp thu tiền online.
- Danh mục dùng id ổn định; đổi tên hiển thị qua PUT không thay id để giữ liên kết sản phẩm. Đơn hàng được giữ làm lịch sử, không cung cấp xóa đơn tùy ý.
- Tài khoản legacy giữ mật khẩu cũ sau khi hash; cần đổi các mật khẩu yếu/demo. Không tự ghi đè hoặc xóa tài khoản đang có.

## Kiểm tra trước khi nộp

1. Cấu hình database replica set/Atlas riêng, chạy setup và khởi động cả frontend/backend theo README.
2. Đăng nhập admin, thêm sản phẩm đủ mùa/mục tiêu; tải lại từ phiên khác, sửa và xóa; kiểm tra bộ lọc.
3. Đăng nhập khách hàng, đặt đơn; mở admin xem đơn và tồn kho; hủy đơn kiểm tra hoàn kho.
4. Tắt backend thử ghi dữ liệu: phải báo lỗi, không hiện thành công.
5. Kiểm tra giao diện trên trình duyệt desktop/mobile và đối chiếu rubric/test case của giảng viên trước khi kết luận sẵn sàng nộp.
