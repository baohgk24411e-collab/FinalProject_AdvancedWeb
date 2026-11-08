import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLangSubject = new BehaviorSubject<'vi' | 'en'>(
    (localStorage.getItem('tqg_lang') as 'vi' | 'en') || 'en'
  );
  public currentLang$ = this.currentLangSubject.asObservable();

  constructor() {
    this.applyLanguage(this.currentLangSubject.value);
  }

  get currentLang(): 'vi' | 'en' {
    return this.currentLangSubject.value;
  }

  setLanguage(lang: 'vi' | 'en') {
    localStorage.setItem('tqg_lang', lang);
    this.currentLangSubject.next(lang);
    this.applyLanguage(lang);
  }

  toggleLanguage() {
    const nextLang = this.currentLang === 'vi' ? 'en' : 'vi';
    this.setLanguage(nextLang);
  }

  private applyLanguage(lang: 'vi' | 'en') {
    if (typeof document !== 'undefined') {
      const body = document.body;
      if (lang === 'vi') {
        body.classList.add('lang-vi');
        body.classList.remove('lang-en');
      } else {
        body.classList.add('lang-en');
        body.classList.remove('lang-vi');
      }
    }
  }
}

