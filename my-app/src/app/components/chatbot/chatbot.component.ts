import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LanguageService } from '../../services/language.service';

interface ChatMessage {
  sender: 'bot' | 'user';
  text: string;
  time: string;
}

@Component({
  standalone: false,
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit {
  isOpen: boolean = false;
  inputText: string = '';
  messages: ChatMessage[] = [];
  weatherInfo: { temp: number; desc: string; icon: string } | null = null;

  quickChipsVi: string[] = [
    'Trái cây nào đang vào mùa?',
    'Gợi ý combo eat clean',
    'Sản phẩm cho người tập gym',
    'Truy xuất nguồn gốc là gì?',
    'Chính sách giao hàng',
    'Hỗ trợ thanh toán'
  ];

  quickChipsEn: string[] = [
    'What fruits are in season?',
    'Recommend eat-clean combo',
    'Products for gym users',
    'What is traceability?',
    'Delivery policy',
    'Checkout support'
  ];

  constructor(
    public langService: LanguageService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.initGreeting();
    this.fetchWeather();
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
  }

  private initGreeting(): void {
    const isEn = this.langService.currentLang === 'en';
    this.messages.push({
      sender: 'bot',
      text: isEn
        ? 'Hello! I am Tu Quy Garden virtual assistant. How can I assist with your fresh fruit & seed orders today?'
        : 'Xin chào! Mình là trợ lý ảo Tứ Quý Garden. Bạn cần tư vấn trái cây theo mùa, hạt dinh dưỡng hay hỗ trợ đặt hàng gì không ạ?',
      time: this.getTime()
    });
  }

  fetchWeather(): void {
    const lat = 10.2709;
    const lng = 105.9922;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code`;
    this.http.get<any>(url).subscribe({
      next: (data) => {
        if (data && data.current) {
          const temp = Math.round(data.current.temperature_2m);
          this.weatherInfo = {
            temp,
            desc: 'Cái Bè, Tiền Giang',
            icon: '☀️'
          };
        }
      },
      error: () => {
        // Fallback
        this.weatherInfo = { temp: 31, desc: 'Cái Bè, Tiền Giang', icon: '☀️' };
      }
    });
  }

  sendChip(chipText: string): void {
    this.sendMessage(chipText);
  }

  onSend(): void {
    if (!this.inputText.trim()) return;
    const text = this.inputText.trim();
    this.inputText = '';
    this.sendMessage(text);
  }

  private sendMessage(text: string): void {
    this.messages.push({
      sender: 'user',
      text,
      time: this.getTime()
    });

    setTimeout(() => {
      const botReply = this.generateResponse(text);
      this.messages.push({
        sender: 'bot',
        text: botReply,
        time: this.getTime()
      });
    }, 600);
  }

  private generateResponse(input: string): string {
    const q = input.toLowerCase();
    const isEn = this.langService.currentLang === 'en';

    if (q.includes('mùa') || q.includes('season') || q.includes('trái cây')) {
      return isEn
        ? 'Currently, Hoa Loc mangoes, Da Xanh pomelos, An Phuoc water apples, and Ri6 durians are in prime season from our Cai Be organic farm! Check out our Products tab for details.'
        : 'Hiện tại Tứ Quý Garden đang có Xoài cát Hòa Lộc chín cây ngọt lịm, Bưởi da xanh Bến Tre mọng nước, Mận An Phước và Sầu riêng Ri6 đang vào rộ mùa ngon nhất ạ! Bạn có thể vào mục "Sản phẩm" để đặt hàng ngay nhé.';
    }

    if (q.includes('eat clean') || q.includes('combo') || q.includes('giảm cân') || q.includes('weight')) {
      return isEn
        ? 'Our Healthy Combos: "Green Detox 7 Days" and "Eat Clean Daily Box" combine fresh seasonal fruits and baked granola seeds with no refined sugar. Super convenient and nutrient-dense!'
        : 'Dạ, combo hot nhất hiện nay là "Combo 7 Ngày Sống Khỏe" và "Eat Clean Box" kết hợp trái cây tươi và Granola siêu hạt nướng mật ong tự nhiên. Bạn có thể ghé mục Combo Healthy hoặc xem tab Dinh dưỡng để tính calo chuẩn nhé!';
    }

    if (q.includes('gym') || q.includes('protein') || q.includes('hạt')) {
      return isEn
        ? 'For workouts and muscle gain, we suggest our Roasted Almonds, Macadamia Nuts, and Super Protein Granola containing high plant-based protein and healthy Omega-3 fats!'
        : 'Dành cho người tập gym, bạn nên chọn Granola Siêu Hạt bổ sung protein thực vật dồi dào, kèm Hạnh nhân rang mộc và Hạt chia hữu cơ giúp no lâu và phục hồi cơ bắp rất tốt ạ.';
    }

    if (q.includes('nguồn gốc') || q.includes('truy xuất') || q.includes('traceability') || q.includes('qr')) {
      return isEn
        ? 'Every single Tứ Quý Garden product features an origin traceability QR code! You can scan or input the batch code in our "Traceability" tab to view farmer info, harvest logs, and VietGAP inspection certificates.'
        : 'Tất cả sản phẩm của Tứ Quý Garden đều có tem QR truy xuất minh bạch từ nông trại đến bàn ăn! Bạn chỉ cần vào tab "Truy xuất" trên thanh menu để quét mã xem nhật ký canh tác và chứng nhận VietGAP nhé.';
    }

    if (q.includes('giao hàng') || q.includes('ship') || q.includes('delivery')) {
      return isEn
        ? 'We offer express delivery within 2-4 hours in HCMC and Hanoi for fresh fruits, and 1-2 days nationwide for nuts and granola. Orders from 500,000đ enjoy FREE shipping!'
        : 'Tứ Quý Garden giao hàng hỏa tốc trong 2-4 giờ tại TP.HCM và Hà Nội cho trái cây tươi, và 1-2 ngày toàn quốc đối với hạt dinh dưỡng. Đơn hàng từ 500.000đ được MIỄN PHÍ vận chuyển ạ!';
    }

    if (q.includes('thanh toán') || q.includes('pay') || q.includes('checkout') || q.includes('momo') || q.includes('vnpay')) {
      return isEn
        ? 'We accept Cash on Delivery (COD), VNPay QR, MoMo e-wallet, and Bank Transfer with high safety standards!'
        : 'Cửa hàng hỗ trợ thanh toán khi nhận hàng (COD), ví điện tử MoMo, VNPAY QR và chuyển khoản ngân hàng tiện lợi và bảo mật ạ.';
    }

    return isEn
      ? 'Thank you for your message! Our farm customer care team has noted your question and is ready to assist. Please also feel free to reach out via hotline 1900 633 123.'
      : 'Cảm ơn bạn đã nhắn tin! Đội ngũ Tứ Quý Garden đã ghi nhận thông tin. Bạn có thể nhấn vào các câu hỏi gợi ý bên dưới hoặc liên hệ hotline 1900 633 123 để được hỗ trợ tức thì nhé!';
  }

  private getTime(): string {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }
}
