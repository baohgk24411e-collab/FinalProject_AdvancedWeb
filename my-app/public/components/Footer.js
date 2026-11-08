// components/Footer.js
window.Components = window.Components || {};

window.Components.renderSiteFooter = function() {
  return (
    '<footer class="main-footer" id="footer-contact">' +
    '<div class="footer-top container">' +
    '<div class="footer-block brand-block">' +
    '<a href="index.html" class="footer-logo">' +
    '<img src="images/logo/logo-white-cropped.png" alt="Tứ Quý Garden Logo" class="footer-logo-img">' +
    '</a>' +
    '<p class="footer-tagline">“Fresh fruits seasonal, healthy seeds daily”</p>' +
    '<p class="footer-desc">' +
    '<span class="lang-vi">Tứ Quý Garden cam kết mang đến nông sản hữu cơ theo mùa tươi ngon, hạt dinh dưỡng chọn lọc và granola lành mạnh chăm sóc sức khỏe gia đình bạn mỗi ngày.</span>' +
    '<span class="lang-en">Tứ Quý Garden commits to bringing ripe seasonal organic produce, premium seeds, and clean healthy granola to nourish your family daily.</span>' +
    '</p>' +
    '<div class="social-links">' +
    '<a href="#" class="social-link" title="Facebook" aria-label="Facebook">' +
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>' +
    '</a>' +
    '<a href="#" class="social-link" title="Instagram" aria-label="Instagram">' +
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>' +
    '</a>' +
    '<a href="#" class="social-link" title="Zalo">' +
    '<span class="zalo-text-icon">Z</span>' +
    '</a>' +
    '</div>' +
    '</div>' +
    '<div class="footer-block">' +
    '<h3 class="footer-title">' +
    '<span class="lang-vi">Danh mục</span><span class="lang-en">Categories</span>' +
    '</h3>' +
    '<ul class="footer-links">' +
    '<li><a href="products.html?category=Fruits"><span class="lang-vi">Trái cây tươi ngon</span><span class="lang-en">Seasonal Fruits</span></a></li>' +
    '<li><a href="products.html?category=Nutritional Seeds"><span class="lang-vi">Hạt dinh dưỡng</span><span class="lang-en">Seeds</span></a></li>' +
    '<li><a href="products.html?category=Granola"><span class="lang-vi">Granola ngũ cốc</span><span class="lang-en">Granola</span></a></li>' +
    '<li><a href="products.html?category=Combo Healthy"><span class="lang-vi">Combo sống khỏe</span><span class="lang-en">Healthy Combos</span></a></li>' +
    '<li><a href="nutrition.html"><span class="lang-vi">Dinh dưỡng cá nhân</span><span class="lang-en">Nutrition Plan</span></a></li>' +
    '<li><a href="traceability.html"><span class="lang-vi">Tra cứu nguồn gốc</span><span class="lang-en">Traceability</span></a></li>' +
    '</ul>' +
    '</div>' +
    '<div class="footer-block">' +
    '<h3 class="footer-title">' +
    '<span class="lang-vi">Hỗ trợ khách hàng</span><span class="lang-en">Customer Service</span>' +
    '</h3>' +
    '<ul class="footer-links">' +
    '<li><a href="about.html"><span class="lang-vi">Giới thiệu cửa hàng</span><span class="lang-en">About Store</span></a></li>' +
    '<li><a href="about.html"><span class="lang-vi">Chính sách đổi trả</span><span class="lang-en">Exchange & Refund</span></a></li>' +
    '<li><a href="about.html"><span class="lang-vi">Chính sách giao hàng</span><span class="lang-en">Shipping Policies</span></a></li>' +
    '<li><a href="about.html"><span class="lang-vi">Câu hỏi thường gặp</span><span class="lang-en">FAQs</span></a></li>' +
    '</ul>' +
    '</div>' +
    '<div class="footer-block contact-block">' +
    '<h3 class="footer-title">' +
    '<span class="lang-vi">Kết nối với chúng tôi</span><span class="lang-en">Contact Info</span>' +
    '</h3>' +
    '<ul class="contact-info-list">' +
    '<li>' +
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>' +
    '<span>Hotline: <strong>1900 633 123</strong></span>' +
    '</li>' +
    '<li>' +
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>' +
    '<span>Email: <a href="mailto:info@tuquygarden.vn">info@tuquygarden.vn</a></span>' +
    '</li>' +
    '<li>' +
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>' +
    '<span>Address: Tu Quy Eco-Farm, Cai Be, Tien Giang</span>' +
    '</li>' +
    '</ul>' +
    '<div class="footer-newsletter">' +
    '<p class="newsletter-txt">' +
    '<span class="lang-vi">Đăng ký để nhận ưu đãi:</span>' +
    '<span class="lang-en">Subscribe to promotions:</span>' +
    '</p>' +
    '<form class="newsletter-form" id="footer-newsletter-form">' +
    '<input type="email" placeholder="Email..." required>' +
    '<button type="submit" class="btn btn-secondary">Ok</button>' +
    '</form>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '<div class="footer-bottom">' +
    '<div class="container footer-bottom-content">' +
    '<p class="copyright-txt">&copy; 2026 Tứ Quý Garden. All Rights Reserved.</p>' +
    '<div class="footer-bottom-links">' +
    '<a href="about.html"><span class="lang-vi">Điều khoản sử dụng</span><span class="lang-en">Terms of Use</span></a>' +
    '<span class="divider">|</span>' +
    '<a href="about.html"><span class="lang-vi">Chính sách bảo mật</span><span class="lang-en">Privacy Policy</span></a>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</footer>'
  );
};
