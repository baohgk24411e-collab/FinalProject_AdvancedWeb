// js/traceability.js

// Mock dataset for traceability batches
const TRACE_DATABASE = {
  "TQG-XOAI-001": {
    nameVi: "Xoài cát Hòa Lộc sạch Cái Bè",
    nameEn: "Hoa Loc Sweet Mangoes - Cái Bè",
    image: "images/Product_Images/03. Hình ảnh/Trái cây/17-Xoài cát Hòa Lộc/17-1.png",
    descVi: "Xoài chín cây thơm lừng, ngọt đậm vị, thu hoạch trực tiếp tại Hợp tác xã Xoài cát Cái Bè, tỉnh Tiền Giang. Đạt tiêu chuẩn VietGAP xuất khẩu.",
    descEn: "Tree-ripened mangoes with rich sweet fragrance, harvested at Cai Be Mango Cooperative, Tien Giang province. Meets export VietGAP standards.",
    coopVi: "HTX Xoài cát Cái Bè, Tiền Giang",
    coopEn: "Cai Be Mango Cooperative, Tien Giang",
    farmerVi: "Bác Hai Chân",
    farmerEn: "Mr. Hai Chan",
    harvestDate: "2026-06-24",
    certs: ["VietGAP", "Chỉ dẫn địa lý", "Organic Packing"],
    lat: 10.2709,
    lng: 105.9922,
    storageVi: "Bảo quản trong tủ lạnh ở nhiệt độ 8°C - 10°C. Tránh tiếp xúc trực tiếp ánh mặt trời hoặc nơi ẩm mốc. Nên sử dụng trong vòng 5 ngày sau khi chín.",
    storageEn: "Store in refrigerator at 8°C - 10°C. Avoid direct sunlight or humid environments. Best consumed within 5 days of ripening.",
    timelineVi: [
      { step: "1", title: "Cải tạo đất & Bón phân hữu cơ", date: "2026-01-15", desc: "Đất trồng tại lô A3 được cày xới, bón lót phân trùn quế và xơ dừa vi sinh giúp bổ sung dưỡng chất tự nhiên. Kiểm tra chỉ số pH đạt 6.5 lý tưởng." },
      { step: "2", title: "Kiểm tra chất lượng & Thu hoạch", date: "2026-06-24", desc: "Kỹ sư đo độ đường brix đạt trên 14%. Quả được hái tay lúc 5:00 sáng, bọc túi giấy bảo vệ để tránh trầy xước và côn trùng gây hại." },
      { step: "3", title: "Rửa sạch & Phân loại tại HTX", date: "2026-06-24", desc: "Rửa sạch mủ xoài bằng hệ thống nước ozon vô trùng, sấy khô bằng quạt gió. Loại bỏ những quả trầy xước, dán mã QR truy xuất nguồn gốc." },
      { step: "4", title: "Đóng gói & Vận chuyển lạnh", date: "2026-06-25", desc: "Xoài đóng gói trong hộp carton hữu cơ đục lỗ thông khí, xếp vào container lạnh kiểm soát nhiệt độ ổn định ở 8°C - 10°C để vận chuyển đến kho Tứ Quý." },
      { step: "5", title: "Phân phối đến cửa hàng Tứ Quý Garden", date: "2026-06-26", desc: "Kiểm tra cảm quan cuối cùng đạt yêu cầu độ chín tươi ngon. Lên kệ trưng bày tại cửa hàng để sẵn sàng phục vụ khách hàng." }
    ],
    timelineEn: [
      { step: "1", title: "Soil preparation & Organic fertilizing", date: "2026-01-15", desc: "Soil in plot A3 was tilled, composted with organic vermicompost and biological coco peat. Soil pH verified at ideal 6.5 index." },
      { step: "2", title: "Quality assurance & Hand harvesting", date: "2026-06-24", desc: "Brix sugar levels tested at over 14%. Harvested by hand at 5:00 AM, wrapped in paper bags to prevent bruises and pests." },
      { step: "3", title: "Washing & Sorting at the Cooperative", date: "2026-06-24", desc: "Washed with sterile ozone water, fan-dried. Sorted to discard bruised fruits, tagged with traceability QR codes." },
      { step: "4", title: "Packaging & Cold chain logistics", date: "2026-06-25", desc: "Packed in ventilated organic cartons. Loaded into refrigerated containers at 8°C - 10°C temperature log for dispatch." },
      { step: "5", title: "Store arrival at Tứ Quý Garden", date: "2026-06-26", desc: "Final sensory check passed for perfect ripeness. Displayed on store shelves ready for customer selection." }
    ]
  },
  "TQG-MAN-002": {
    nameVi: "Mận hậu chín ngọt Bản Ôn, Sơn La",
    nameEn: "Sweet Red Plums - Ban On, Son La",
    image: "images/Product_Images/03. Hình ảnh/Trái cây/3-Mận hậu Người Hmong/3-1.png",
    descVi: "Mận hậu chín đỏ ngọt lịm pha chút chua nhẹ giòn tan, phủ phấn trắng tự nhiên, hái từ nông trại cao nguyên Mộc Châu lộng gió.",
    descEn: "Ripe sweet red plums with crispy texture and natural white powder, harvested from high-altitude Moc Chau highlands.",
    coopVi: "HTX Mận Hậu sạch Bản Ôn, Sơn La",
    coopEn: "Ban On Plum Cooperative, Son La",
    farmerVi: "Chị Mỷ (Dân tộc H'Mông)",
    farmerEn: "Mrs. My (H'mong Ethnic)",
    harvestDate: "2026-06-23",
    certs: ["VietGAP", "An Toàn Thực Phẩm", "Hái tay chọn lọc"],
    lat: 20.8491,
    lng: 104.6294,
    storageVi: "Bảo quản tốt nhất trong tủ lạnh ở nhiệt độ 5°C - 8°C giúp quả giữ độ giòn ngọt. Rửa kỹ bằng nước sạch trước khi ăn.",
    storageEn: "Best preserved in refrigerator at 5°C - 8°C to retain crispiness. Wash thoroughly with clean water before eating.",
    timelineVi: [
      { step: "1", title: "Chăm sóc mùa hoa và đậu quả", date: "2026-02-10", desc: "Tỉa cành tạo tán giúp đón nắng tốt nhất. Sử dụng phân bón lá sinh học an toàn không hóa chất bảo vệ thực vật độc hại." },
      { step: "2", title: "Thu hoạch sáng sớm trên sườn núi", date: "2026-06-23", desc: "Thu hái thủ công từng quả chín đỏ còn nguyên cuống lá và phấn trắng bảo vệ tự nhiên, đựng vào gùi wicker tre truyền thống." },
      { step: "3", title: "Phân loại kích thước tại nhà đóng gói", date: "2026-06-23", desc: "Mận được phân loại theo đường kính lớn (loại VIP), loại bỏ quả giập. Đóng vào khay nhựa sinh học tự hủy thân thiện môi trường." },
      { step: "4", title: "Chuyển phát nhanh đường hàng không", date: "2026-06-24", desc: "Vận chuyển nhanh bằng xe tải giữ nhiệt đến sân bay Nội Bài, bay thẳng vào TP. HCM để bảo toàn độ giòn rụm tối đa." },
      { step: "5", title: "Lên kệ cửa hàng Tứ Quý Garden", date: "2026-06-25", desc: "Trưng bày tủ mát 5°C tại cửa hàng Tứ Quý Garden. Khách hàng quét mã có thể cảm nhận vị giòn ngọt nguyên bản núi rừng." }
    ],
    timelineEn: [
      { step: "1", title: "Blossoming & Fruit care", date: "2026-02-10", desc: "Pruned branches to maximize sunlight. Applied organic bio-fertilizers without using synthetic chemical sprays." },
      { step: "2", title: "Harvesting on mountain slopes", date: "2026-06-23", desc: "Hand-picked ripe red plums retaining leaf stems and natural white bloom coating. Collected in traditional bamboo back baskets." },
      { step: "3", title: "Sizing & Biodegradable packaging", date: "2026-06-23", desc: "Sorted for premium diameter sizes. Packed in eco-friendly biodegradable cornstarch trays." },
      { step: "4", title: "Air cargo express shipping", date: "2026-06-24", desc: "Loaded in insulated trucks to Noi Bai airport. Flown directly to Ho Chi Minh City to maintain ultimate freshness and crunch." },
      { step: "5", title: "Shelf display at Tứ Quý Garden", date: "2026-06-25", desc: "Displayed in 5°C cooling shelves at Tứ Quý Garden stores, preserving mountain fresh taste." }
    ]
  },
  "TQG-BUOI-003": {
    nameVi: "Bưởi da xanh Bến Tre ruột đỏ VIP",
    nameEn: "Green Skin Pink Pomelos - Bến Tre",
    image: "images/Product_Images/03. Hình ảnh/Trái cây/9-Bưởi da xanh/9-2.png",
    descVi: "Múi bưởi hồng đậm, mọng nước, dễ lột, ngọt thanh không đắng. Được canh tác theo tiêu chuẩn GlobalGAP khắt khe nhất.",
    descEn: "Rich pink pulps, juicy, easy to peel, sweet and refreshingly crisp. Grown under rigorous GlobalGAP protocols.",
    coopVi: "HTX Bưởi Da Xanh Mỏ Cày Bắc, Bến Tre",
    coopEn: "Mo Cay Bac Pomelo Cooperative, Ben Tre",
    farmerVi: "Chú Tư Bông",
    farmerEn: "Mr. Tu Bong",
    harvestDate: "2026-06-22",
    certs: ["GlobalGAP", "OCOP 4 Sao", "Không hóa chất bảo quản"],
    lat: 10.1554,
    lng: 106.3314,
    storageVi: "Bảo quản ở nơi thoáng mát, khô ráo tự nhiên (15°C - 20°C). Tránh đè nặng lên quả. Múi bưởi lột sẵn bảo quản hộp kín trong tủ lạnh dùng tốt nhất trong 3 ngày.",
    storageEn: "Store in a cool, dry natural place (15°C - 20°C). Avoid stacking. Peeled segments should be stored in an airtight container in the fridge and eaten within 3 days.",
    timelineVi: [
      { step: "1", title: "Bọc trái chống ruồi vàng", date: "2026-03-05", desc: "Khi trái bằng quả cam, tiến hành bọc lưới chuyên dụng ngăn chặn ruồi vàng và sâu hại tự nhiên mà không cần phun thuốc hóa học." },
      { step: "2", title: "Thu hoạch tuyển chọn quả bánh tẻ", date: "2026-06-22", desc: "Hái quả đúng độ chín vừa phải (da căng láng, gõ tiếng trầm đục). Cắt cuống dài 2cm và bôi vôi đầu cuống tránh vi khuẩn xâm nhập." },
      { step: "3", title: "Vệ sinh & Xử lý quang học", date: "2026-06-22", desc: "Lau bóng vỏ nhẹ nhàng bằng khăn mềm, chiếu tia cực tím khử trùng nấm ngoài vỏ bưởi trước khi đưa vào rổ." },
      { step: "4", title: "Vận chuyển đường sông và đường bộ", date: "2026-06-23", desc: "Vận chuyển bằng ghe từ vườn tập kết về nhà máy, đóng thùng xuất phát đi xe tải tải trọng lớn về kho trung tâm." },
      { step: "5", title: "Bàn giao đến các siêu thị Tứ Quý", date: "2026-06-24", desc: "Kiểm tra chất lượng vỏ, cân nặng đạt từ 1.2kg - 1.5kg chuẩn tiêu chuẩn OCOP 4 sao trước khi trưng bày." }
    ],
    timelineEn: [
      { step: "1", title: "Fruit wrapping against fruit flies", date: "2026-03-05", desc: "Wrapped each young fruit in protective mesh nets when it reached orange size to defend against insects naturally without chemical spraying." },
      { step: "2", title: "Harvesting by size and skin tension", date: "2026-06-22", desc: "Harvested at peak maturity (stretched skin, deep resonant sound when tapped). Cut stem with 2cm length and applied lime to prevent rot." },
      { step: "3", title: "Cleaning & UV sterilization", date: "2026-06-22", desc: "Gently polished the rind with soft towels. Treated with UV light to sterilize surface spores before packing." },
      { step: "4", title: "River & road transport", date: "2026-06-23", desc: "Shipped via wooden boats to consolidation stations, then loaded on trucks to distribution center." },
      { step: "5", title: "Stock arrival at Tứ Quý stores", date: "2026-06-24", desc: "Verified pomelo weight is within 1.2kg - 1.5kg range (OCOP 4-star specification) before retail display." }
    ]
  },
  "TQG-HAT-004": {
    nameVi: "Mix Hạt Dinh Dưỡng 5 loại cao cấp",
    nameEn: "Premium 5-Nut Mixed Seeds",
    image: "images/Product_Images/03. Hình ảnh/granola/Mix Nuts 5 loại.png",
    descVi: "Hạt dinh dưỡng sấy giòn thơm ngậy bao gồm Macca, Hạnh nhân, Hạt điều, Óc chó, và Hạt bí hữu cơ sấy lạnh giữ nguyên dưỡng chất.",
    descEn: "Bake-crisp nutritional nuts including Macadamia, Almond, Cashew, Walnut, and organic Pumpkin seeds dried with low-temp technology.",
    coopVi: "HTX Nông nghiệp Hữu cơ Krông Năng, Đắk Lắk",
    coopEn: "Krong Nang Organic Agriculture Coop, Dak Lak",
    farmerVi: "Hộ liên kết K'Măng",
    farmerEn: "K'Mang Farm Union",
    harvestDate: "2026-06-20",
    certs: ["ISO 22000", "HACCP", "Sấy lạnh tự nhiên"],
    lat: 12.9818,
    lng: 108.2435,
    storageVi: "Bảo quản ở nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp. Sau khi mở nắp, cần vặn chặt hũ thủy tinh và nên bảo quản mát trong tủ lạnh để giữ độ giòn tốt nhất.",
    storageEn: "Store in a cool, dry place away from direct sunlight. Seal tight after opening, refrigeration is recommended to preserve optimal crunch.",
    timelineVi: [
      { step: "1", title: "Thu hoạch hạt thô vùng cao nguyên", date: "2026-04-10", desc: "Điều thu hái tại Bình Phước, Macca thu hoạch tại Đắk Lắk khi nứt vỏ tự nhiên. Đảm bảo thu mua giá công bằng hỗ trợ bà con đồng bào." },
      { step: "2", title: "Tách vỏ cứng & Phơi sấy sơ bộ", date: "2026-04-18", desc: "Hạt được tách lớp vỏ gỗ cứng bằng máy chuyên dụng tránh giập nát nhân, phơi sấy hạ độ ẩm hạt xuống dưới 6% để chống nấm mốc." },
      { step: "3", title: "Sấy lạnh vô trùng công nghệ cao", date: "2026-06-20", desc: "Nướng chín bằng khí nóng đối lưu tuần hoàn vô trùng ở nhiệt độ thấp giúp hạt chín đều, giòn rụm mà không làm biến tính các acid béo tốt." },
      { step: "4", title: "Phối trộn tỉ lệ & Hút chân không", date: "2026-06-21", desc: "Phối trộn hạt theo công thức dinh dưỡng vàng, đóng hũ thủy tinh tiệt trùng và hút chân không, chèn hạt chống ẩm thực phẩm." },
      { step: "5", title: "Giao đến showroom Tứ Quý Garden", date: "2026-06-23", desc: "Sản phẩm được đóng thùng niêm phong mã chống giả và phân phối tới hệ thống showroom toàn quốc." }
    ],
    timelineEn: [
      { step: "1", title: "Harvesting raw nuts in Central Highlands", date: "2026-04-10", desc: "Harvested ripe cashews and macadamias at peak maturity. Traded under Fairtrade concepts supporting indigenous communities." },
      { step: "2", title: "Shelling & Dehumidification", date: "2026-04-18", desc: "Removed hard wood shells with precise crackers to avoid kernel breakage. Dried raw nuts until moisture dropped below 6% to prevent mold." },
      { step: "3", title: "Low-temperature sterilization baking", date: "2026-06-20", desc: "Baked with hot sterile air convection cycles at low temperatures to ensure even crispiness and protect healthy omega fats." },
      { step: "4", title: "Ratio mixing & Vacuum sealing", date: "2026-06-21", desc: "Mixed nuts based on optimal nutrition ratios. Sealer-packed in sterilized glass jars with food-grade silica gel pouches." },
      { step: "5", title: "Showroom dispatch at Tứ Quý Garden", date: "2026-06-23", desc: "Sealed cases with anti-counterfeit labels and dispatched to showrooms nationwide." }
    ]
  },
  "TQG-CHIA-005": {
    nameVi: "Hạt chia hữu cơ nhập khẩu Úc",
    nameEn: "Organic Chia Seeds - Imported from Australia",
    image: "images/Product_Images/03. Hình ảnh/granola/Hạt Chia.png",
    descVi: "Hạt chia hữu cơ nhập khẩu nguyên bao từ Úc, giàu chất xơ, Omega-3 tốt cho hệ tim mạch và hỗ trợ giảm cân hiệu quả.",
    descEn: "Organic chia seeds imported from Australia, rich in fiber, Omega-3 for cardiovascular health and weight management.",
    coopVi: "Nông trại hữu cơ EcoFarm Australia (Nhập khẩu bởi Tứ Quý)",
    coopEn: "EcoFarm Australia Organic (Imported by Tu Quy Garden)",
    farmerVi: "Gia đình nông dân John Smith",
    farmerEn: "John Smith's Family",
    harvestDate: "2026-06-15",
    certs: ["Organic Australia", "Non-GMO", "USDA Organic"],
    lat: -27.5584,
    lng: 151.9507,
    storageVi: "Bảo quản ở nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp. Sau khi mở túi nên đậy kín hoặc cho vào hũ thủy tinh.",
    storageEn: "Store in a cool, dry place away from direct sunlight. Seal tight or transfer to a glass jar after opening.",
    timelineVi: [
      { step: "1", title: "Chuẩn bị đất và gieo hạt", date: "2026-02-10", desc: "Gieo hạt chia hữu cơ theo hàng lối trên cánh đồng cao nguyên Darling Downs rộng lớn." },
      { step: "2", title: "Chăm sóc tự nhiên không chất độc", date: "2026-04-05", desc: "Tưới tiêu bằng nguồn nước mưa tự nhiên, làm cỏ bằng máy chuyên dụng không dùng thuốc diệt cỏ hóa học." },
      { step: "3", title: "Thu hoạch cơ giới hóa", date: "2026-06-15", desc: "Thu hoạch hạt chia bằng máy gặt đập khi hoa chia khô héo hoàn toàn, tách hạt sạch khỏi vỏ hoa." },
      { step: "4", title: "Khử trùng & Đóng bao xuất khẩu", date: "2026-06-18", desc: "Làm sạch hạt bằng luồng khí lạnh, chiếu tia hồng ngoại khử trùng và đóng bao kín 25kg xuất khẩu." },
      { step: "5", title: "Nhập cảng & Lên kệ Tứ Quý Garden", date: "2026-06-25", desc: "Vận chuyển về cảng Cát Lái, thông quan và đóng gói nhỏ hũ thủy tinh tại kho Tứ Quý Garden để sẵn sàng lên kệ." }
    ],
    timelineEn: [
      { step: "1", title: "Soil preparation & Sowing", date: "2026-02-10", desc: "Sowed organic chia seeds in neat rows across the vast Darling Downs highland fields." },
      { step: "2", title: "Natural weeding & Tending", date: "2026-04-05", desc: "Watered by natural rain, weeded using mechanical tools without synthetic chemicals." },
      { step: "3", title: "Mechanical harvesting", date: "2026-06-15", desc: "Harvested with combines when flowers completely dried up, separating tiny seeds from flower shells." },
      { step: "4", title: "Sterilization & Bulk packing", date: "2026-06-18", desc: "Cleaned via cool air flow, sterilized with infrared radiation, and packed in 25kg sealed bulk bags for export." },
      { step: "5", title: "Importation & Shelf display", date: "2026-06-25", desc: "Shipped to Cat Lai port, cleared customs, repackaged into glass jars at Tu Quy Garden facility, and placed on store shelves." }
    ]
  },
  "TQG-ROI-006": {
    nameVi: "Roi An Phước đỏ ngọt Cái Bè",
    nameEn: "An Phuoc Red Rose Apple - Cai Be",
    image: "images/Product_Images/03. Hình ảnh/Trái cây/34-Roi mận An Phước/34-2.png",
    descVi: "Roi An Phước hình quả chuông màu đỏ sẫm rất bắt mắt, thịt quả dày giòn xốp mọng nước, vị ngọt thanh và thơm dịu, thu hoạch trực tiếp tại nhà vườn Cái Bè.",
    descEn: "An Phuoc Red Rose Apple shaped like a bell with deep red color, thick crispy flesh, juicy, sweet and mild fragrance.",
    coopVi: "HTX Cây ăn trái hữu cơ Cái Bè, Tiền Giang",
    coopEn: "Cai Be Organic Fruit Cooperative, Tien Giang",
    farmerVi: "Chú Năm Hùng",
    farmerEn: "Mr. Nam Hung",
    harvestDate: "2026-06-25",
    certs: ["VietGAP", "An Toàn Thực Phẩm", "Chuẩn hữu cơ"],
    lat: 10.2820,
    lng: 105.9754,
    storageVi: "Bảo quản mát trong tủ lạnh ở nhiệt độ 6°C - 10°C để duy trì độ giòn mọng nước. Rửa sạch bằng nước mát trước khi ăn.",
    storageEn: "Store in refrigerator at 6°C - 10°C to retain crispiness and juiciness. Wash with cool water before eating.",
    timelineVi: [
      { step: "1", title: "Bọc túi lưới bảo vệ chùm quả", date: "2026-03-20", desc: "Tiến hành bọc túi lưới nilon chuyên dụng cho từng chùm roi non để ngăn ngừa sâu hại tự nhiên mà không phun thuốc bảo vệ thực vật." },
      { step: "2", title: "Bón phân hữu cơ làm ngọt quả", date: "2026-04-15", desc: "Bón phân hữu cơ sinh học làm từ phân chuồng hoai mục và phân cá ủ vi sinh giúp quả mọng nước ngọt thanh tự nhiên." },
      { step: "3", title: "Thu hoạch chín lúc sáng sớm", date: "2026-06-25", desc: "Thu hái roi bằng tay lúc sáng sớm mát mẻ khi vỏ đạt độ chín đỏ sẫm bóng mịn, tránh làm giập vỏ ngoài mỏng manh." },
      { step: "4", title: "Rửa sạch bằng nước ozone & Đóng khay", date: "2026-06-25", desc: "Rửa sạch bụi bẩn qua bồn sục khí ozone vô trùng, hong khô gió và đóng khay sinh học bọc màng co thân thiện." },
      { step: "5", title: "Vận chuyển lạnh & Lên kệ showroom", date: "2026-06-26", desc: "Vận chuyển bằng xe mát về cửa hàng Tứ Quý Garden và trưng bày mát lên quầy kệ trong vòng 24 giờ kể từ lúc thu hoạch." }
    ],
    timelineEn: [
      { step: "1", title: "Pest protection bagging", date: "2026-03-20", desc: "Wrapped young rose apple clusters in specialized mesh bags to exclude insect pests without using chemical sprays." },
      { step: "2", title: "Organic fertilizing", date: "2026-04-15", desc: "Applied organic compost and fermented fish emulsion to feed trees, enhancing fruit sweetness and pulp thickness." },
      { step: "3", title: "Hand-picking at dawn", date: "2026-06-25", desc: "Harvested by hand in the early morning coolness when skin reached deep glossy red color, minimizing bruising." },
      { step: "4", title: "Ozone wash & Biodegradable packaging", date: "2026-06-25", desc: "Sanitized in clean ozone bubble baths, fan-dried, and packed in biodegradable trays with protective film." },
      { step: "5", title: "Cold logistics & Store arrival", date: "2026-06-26", desc: "Shipped in refrigerated trucks to Tu Quy Garden showrooms, displayed on cooling racks within 24 hours of harvest." }
    ]
  }
};;

document.addEventListener("DOMContentLoaded", () => {
  // Check URL query parameters for default batch
  const batchCode = window.getUrlParam ? window.getUrlParam("batch") : "";
  if (batchCode) {
    const input = document.getElementById("trace-search-input");
    if (input) input.value = batchCode;

    // Select option in dropdown if matching
    const select = document.getElementById("trace-sample-select");
    if (select && TRACE_DATABASE[batchCode]) {
      select.value = batchCode;
    }

    executeTrace(batchCode);
  }
});

// Dropdown change listener
window.handleSampleSelect = function (val) {
  if (!val) return;
  const input = document.getElementById("trace-search-input");
  if (input) input.value = val;
  executeTrace(val);
};

// Search submit button trigger
window.handleTraceSearchSubmit = function () {
  const input = document.getElementById("trace-search-input");
  if (!input) return;
  const val = input.value.trim().toUpperCase();
  if (!val) {
    const isEn = document.body.classList.contains("lang-en");
    window.showToast(isEn ? "Please enter a batch code." : "Vui lòng nhập mã lô hàng để tra cứu.", "error");
    return;
  }
  executeTrace(val);
};

// Run the search and render results
function executeTrace(code) {
  const root = document.getElementById("trace-results-root");
  if (!root) return;

  const data = TRACE_DATABASE[code];
  const isEn = document.body.classList.contains("lang-en");

  if (!data) {
    // If not found, show nice mockup warning
    window.showToast(isEn ? "Batch code not found! Try a sample." : "Không tìm thấy mã lô hàng! Hãy thử các mã mẫu có sẵn.", "error");
    root.style.display = "none";
    return;
  }

  // Update batch info values
  document.getElementById("result-product-img").src = data.image;
  document.getElementById("result-product-name").innerText = isEn ? data.nameEn : data.nameVi;
  document.getElementById("result-batch-code").innerText = `${isEn ? "Batch Code" : "Mã lô"}: #${code}`;
  document.getElementById("result-product-desc").innerText = isEn ? data.descEn : data.descVi;
  document.getElementById("result-coop").innerText = isEn ? data.coopEn : data.coopVi;
  document.getElementById("result-farmer").innerText = isEn ? data.farmerEn : data.farmerVi;
  document.getElementById("result-date").innerText = new Date(data.harvestDate).toLocaleDateString(isEn ? 'en-US' : 'vi-VN');

  // Update storage instruction
  const storageEl = document.getElementById("result-storage");
  if (storageEl) {
    storageEl.innerText = isEn ? (data.storageEn || "") : (data.storageVi || "");
  }

  // Update certifications list
  const certsContainer = document.getElementById("result-certs");
  if (certsContainer) {
    certsContainer.innerHTML = data.certs.map(c => `<span class="cert-badge-item">${c}</span>`).join("");
  }

  // Render horizontal journey stepper nodes matching CSS
  const timelineRoot = document.getElementById("trace-timeline-root");
  if (timelineRoot) {
    const timelineData = isEn ? data.timelineEn : data.timelineVi;
    const stepIcons = {
      "1": "🌱",
      "2": "🧑‍🌾",
      "3": "🧼",
      "4": "📦",
      "5": "🏪"
    };
    timelineRoot.innerHTML = timelineData.map((node, index) => {
      const icon = stepIcons[node.step] || "📍";
      // The last step can be set as active (e.g. current location) and others as completed
      const statusClass = (index === timelineData.length - 1) ? "active" : "completed";
      return `
        <div class="journey-step-card ${statusClass}">
          <div class="journey-step-icon">${icon}</div>
          <div class="journey-step-body">
            <div class="journey-step-name">${node.title}</div>
            <div class="journey-step-date">${new Date(node.date).toLocaleDateString(isEn ? 'en-US' : 'vi-VN')}</div>
            <div class="journey-step-desc">${node.desc}</div>
          </div>
        </div>
      `;
    }).join("");
  }

  // Render Leaflet Map
  const mapContainer = document.getElementById("trace-map");
  if (mapContainer && data.lat && data.lng && typeof L !== "undefined") {
    // If map already initialized, just setView and update marker
    if (window.traceMap) {
      window.traceMap.setView([data.lat, data.lng], 13);
      if (window.traceMarker) {
        window.traceMarker.setLatLng([data.lat, data.lng]);
        window.traceMarker.setPopupContent(`<strong>${isEn ? data.coopEn : data.coopVi}</strong><br/>${isEn ? 'Lead farmer: ' : 'Nông dân: '} ${isEn ? data.farmerEn : data.farmerVi}`).openPopup();
      }
    } else {
      // Otherwise, create map
      window.traceMap = L.map('trace-map', { scrollWheelZoom: false }).setView([data.lat, data.lng], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(window.traceMap);

      window.traceMarker = L.marker([data.lat, data.lng]).addTo(window.traceMap)
        .bindPopup(`<strong>${isEn ? data.coopEn : data.coopVi}</strong><br/>${isEn ? 'Lead farmer: ' : 'Nông dân: '} ${isEn ? data.farmerEn : data.farmerVi}`)
        .openPopup();
    }
    // Force redraw of leaflet map due to dynamic show container
    setTimeout(() => {
      if (window.traceMap) window.traceMap.invalidateSize();
    }, 450);
  }

  // Display results
  root.style.display = "block";

  // Smooth scroll to results
  root.scrollIntoView({ behavior: "smooth" });
}

// BEEP AUDIO FEEDBACK
function playBeepSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.type = "sine";
    oscillator.frequency.value = 1200; // Tone pitch (Hz)
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.25);
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.3);
  } catch (err) {
    console.warn("Web Audio API blocked or not supported", err);
  }
}

// QR CODE WEBCAM SCANNER & SIMULATOR
let html5QrScanner = null;
window.openQrScanner = function () {
  document.getElementById("qr-modal-container").classList.add("open");
  document.getElementById("qr-sim-select").value = "";
  isCameraMirrored = false;

  const isEn = document.body.classList.contains("lang-en");
  document.getElementById("qr-scanner-status").innerText = isEn ? "Status: Ready" : "Trạng thái: Sẵn sàng";

  if (typeof Html5Qrcode !== "undefined") {
    html5QrScanner = new Html5Qrcode("qr-webcam-reader");
    const config = { fps: 10, qrbox: { width: 180, height: 180 } };

    html5QrScanner.start(
      { facingMode: "environment" },
      config,
      (decodedText) => {
        playBeepSound();
        document.getElementById("qr-scanner-status").innerText = isEn ? `Scanned: ${decodedText}` : `Quét thấy: ${decodedText}`;
        setTimeout(() => {
          closeQrScanner();
          const val = decodedText.trim().toUpperCase();
          const searchInput = document.getElementById("trace-search-input");
          if (searchInput) searchInput.value = val;

          const select = document.getElementById("trace-sample-select");
          if (select && TRACE_DATABASE[val]) {
            select.value = val;
          }
          executeTrace(val);
        }, 800);
      },
      (errorMessage) => {
        // Ignored
      }
    ).catch(err => {
      console.log("No web camera available or insecure context. Using simulation mode.", err);
    });
  }
};

window.closeQrScanner = function () {
  document.getElementById("qr-modal-container").classList.remove("open");
  if (html5QrScanner) {
    try {
      html5QrScanner.stop().then(() => {
        html5QrScanner = null;
      }).catch(err => console.log("Scanner stop error:", err));
    } catch (e) {
      html5QrScanner = null;
    }
  }
};

window.runSimulatedScan = function (val) {
  if (!val) {
    document.getElementById("virtual-qr-code").innerHTML = `
      <svg viewBox="0 0 100 100" style="width: 100%; height: 100%; display: block; opacity: 0.5;">
        <rect width="100" height="100" fill="#f8f8f8" rx="6" />
        <rect x="15" y="15" width="25" height="25" fill="#aaa" />
        <rect x="60" y="15" width="25" height="25" fill="#aaa" />
        <rect x="15" y="60" width="25" height="25" fill="#aaa" />
        <rect x="50" y="50" width="10" height="10" fill="#aaa" />
        <text x="50" y="80" text-anchor="middle" font-size="7" fill="#666">Chờ chọn sản phẩm</text>
      </svg>
    `;
    document.getElementById("virtual-qr-label").innerText = document.body.classList.contains("lang-en") ? "No product selected" : "Chưa có sản phẩm";
    return;
  }

  // Render simulated QR code image on screen
  if (val === "TQG-XOAI-001") {
    document.getElementById("virtual-qr-code").innerHTML = `<img src="demo_assets/qr_xoai_cat.png" style="width: 100%; height: 100%; object-fit: contain;" />`;
  } else if (val === "TQG-MAN-002") {
    document.getElementById("virtual-qr-code").innerHTML = `<img src="demo_assets/qr_man_hau.png" style="width: 100%; height: 100%; object-fit: contain;" />`;
  } else if (val === "TQG-BUOI-003") {
    document.getElementById("virtual-qr-code").innerHTML = `<img src="demo_assets/qr_buoi_da_xanh.png" style="width: 100%; height: 100%; object-fit: contain;" />`;
  } else if (val === "TQG-HAT-004") {
    document.getElementById("virtual-qr-code").innerHTML = `<img src="demo_assets/qr_hat_dinh_duong.png" style="width: 100%; height: 100%; object-fit: contain;" />`;
  } else if (val === "TQG-CHIA-005") {
    document.getElementById("virtual-qr-code").innerHTML = `<img src="demo_assets/qr_hat_chia.png" style="width: 100%; height: 100%; object-fit: contain;" />`;
  } else if (val === "TQG-ROI-006") {
    document.getElementById("virtual-qr-code").innerHTML = `<img src="demo_assets/qr_roi_an_phuoc.png" style="width: 100%; height: 100%; object-fit: contain;" />`;
  } else {
    document.getElementById("virtual-qr-code").innerHTML = getQrSvg(val);
  }
  document.getElementById("virtual-qr-label").innerText = val;

  const isEn = document.body.classList.contains("lang-en");
  document.getElementById("qr-scanner-status").innerText = isEn ? "Scanning..." : "Đang quét...";

  // Simulate delay
  setTimeout(() => {
    playBeepSound();
    document.getElementById("qr-scanner-status").innerText = isEn ? "Scanned successfully!" : "Quét thành công!";

    setTimeout(() => {
      closeQrScanner();
      const searchInput = document.getElementById("trace-search-input");
      if (searchInput) searchInput.value = val;

      const select = document.getElementById("trace-sample-select");
      if (select) select.value = val;

      executeTrace(val);
    }, 800);
  }, 1500);
};

// SVG-based dynamic QR Code Generator
function getQrSvg(code) {
  let pathD = "";
  if (code === "TQG-XOAI-001") {
    pathD = "M10 10h30v30h-30z M15 15h20v20h-20z M50 10h30v30h-30z M55 15h20v20h-20z M10 50h30v30h-30z M15 55h20v20h-20z M55 55h5v5h-5z M70 70h10v10h-10z M60 50h10v10h-10z M75 60h5v5h-5z M50 75h5v5h-5z M60 65h5v5h-5z";
  } else if (code === "TQG-MAN-002") {
    pathD = "M10 10h30v30h-30z M15 15h20v20h-20z M50 10h30v30h-30z M55 15h20v20h-20z M10 50h30v30h-30z M15 55h20v20h-20z M60 60h10v10h-10z M50 50h5v5h-5z M75 75h5v5h-5z M70 50h5v5h-5z M55 70h5v5h-5z M65 75h5v5h-5z";
  } else if (code === "TQG-BUOI-003") {
    pathD = "M10 10h30v30h-30z M15 15h20v20h-20z M50 10h30v30h-30z M55 15h20v20h-20z M10 50h30v30h-30z M15 55h20v20h-20z M55 65h10v10h-10z M50 60h5v5h-5z M70 75h10v5h-10z M60 50h5v5h-5z M75 55h5v15h-5z";
  } else if (code === "TQG-CHIA-005") {
    pathD = "M10 10h30v30h-30z M15 15h20v20h-20z M50 10h30v30h-30z M55 15h20v20h-20z M10 50h30v30h-30z M15 55h20v20h-20z M50 50h10v5h-10z M65 50h15v5h-15z M60 60h5v10h-5z M70 60h10v5h-10z M50 70h10v5h-10z M65 75h15v5h-15z";
  } else if (code === "TQG-ROI-006") {
    pathD = "M10 10h30v30h-30z M15 15h20v20h-20z M50 10h30v30h-30z M55 15h20v20h-20z M10 50h30v30h-30z M15 55h20v20h-20z M50 50h5v10h-5z M60 50h5v5h-5z M70 50h10v10h-10z M55 65h10v5h-10z M70 65h5v15h-5z M50 75h15v5h-15z";
  } else {
    pathD = "M10 10h30v30h-30z M15 15h20v20h-20z M50 10h30v30h-30z M55 15h20v20h-20z M10 50h30v30h-30z M15 55h20v20h-20z M70 60h10v10h-10z M50 70h5v5h-5z M55 50h10v5h-10z M65 75h5v5h-5z M75 50h5v5h-5z";
  }

  return `
    <svg viewBox="0 0 90 90" style="width: 100%; height: 100%; display: block;">
      <!-- White background -->
      <rect width="90" height="90" fill="white" rx="6" />
      <!-- Grid matrix path -->
      <path d="${pathD}" fill="#1F4D2B" style="fill-rule: evenodd;" />
    </svg>
  `;
}

let isCameraMirrored = false;
window.toggleCameraMirror = function () {
  const video = document.querySelector("#qr-webcam-reader video");
  if (video) {
    isCameraMirrored = !isCameraMirrored;
    video.style.transform = isCameraMirrored ? "scaleX(-1)" : "scaleX(1)";
  } else {
    // Also try checking parent canvas/components if customized by html5-qrcode
    const isEn = document.body.classList.contains("lang-en");
    window.showToast(isEn ? "No active camera feed found to mirror." : "Không tìm thấy luồng camera hoạt động để lật.", "warning");
  }
};
