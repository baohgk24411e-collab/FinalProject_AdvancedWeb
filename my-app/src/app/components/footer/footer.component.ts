import { Component } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  newsletterEmail: string = '';
  newsletterSuccess: boolean = false;

  subscribeNewsletter(event: Event): void {
    event.preventDefault();
    if (this.newsletterEmail.trim()) {
      this.newsletterSuccess = true;
      this.newsletterEmail = '';
      setTimeout(() => {
        this.newsletterSuccess = false;
      }, 4000);
    }
  }
}
