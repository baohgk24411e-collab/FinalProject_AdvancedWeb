import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { LanguageService } from '../../services/language.service';

declare var window: any;
declare var document: any;

@Component({
  standalone: false,
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit, AfterViewInit {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private orderService: OrderService,
    public langService: LanguageService
  ) {}

  ngOnInit(): void {
    // Subscribe to query params if needed
    this.route.queryParams.subscribe(params => {
      // Handle dynamic filters or tabs
    });
  }

  ngAfterViewInit(): void {
    this.loadPageScript();
  }

  private loadPageScript(): void {
    const runScripts = () => {
      try {
        // Page-specific inline runner
        const runner = new Function(`function handleContactSubmit(event) {
      event.preventDefault();
      
      const name = document.getElementById("contact-name").value.trim();
      const email = document.getElementById("contact-email").value.trim();
      const phone = document.getElementById("contact-phone").value.trim();
      const message = document.getElementById("contact-message").value.trim();
      
      if (!name || !email || !phone || !message) {
        alert("Please fill in all required fields marked with *");
        return;
      }
      
      // Simulate submission success
      document.getElementById("contact-form-container").style.display = "none";
      document.getElementById("contact-success").style.display = "block";
    }
    
    function resetContactForm() {
      document.getElementById("contact-form").reset();
      document.getElementById("contact-success").style.display = "none";
      document.getElementById("contact-form-container").style.display = "block";
    }`); runner.call(window);
        
        // Trigger DOM content loaded synthetic event if needed
        document.dispatchEvent(new Event('DOMContentLoaded'));
      } catch (err) {
        console.warn('Script execution notice:', err);
      }
    };

    runScripts();
  }
}
