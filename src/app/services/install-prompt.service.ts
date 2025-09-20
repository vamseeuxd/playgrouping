import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root'
})
export class InstallPromptService {
  private deferredPrompt: any;
  private isIOS = false;

  constructor(private platform: Platform) {
    this.isIOS = this.platform.is('ios');
    this.setupInstallPrompt();
  }

  private setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      // this.showInstallPrompt();
    });

    if (this.isIOS && !this.isStandalone()) {
      setTimeout(() => this.showIOSInstallPrompt(), 2000);
    }
  }

  private isStandalone(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches || 
           (window.navigator as any).standalone === true;
  }

  private showInstallPrompt() {
    /* if (!this.isStandalone()) {
      const banner = document.createElement('div');
      banner.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; right: 0; background: #3880ff; color: white; padding: 12px; text-align: center; z-index: 9999; font-size: 14px;">
          Install Play Grouping app for better experience
          <button onclick="this.parentElement.parentElement.style.display='none'" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 4px 8px; margin-left: 10px; border-radius: 4px; cursor: pointer;">✕</button>
          <button id="installBtn" style="background: white; border: none; color: #3880ff; padding: 4px 12px; margin-left: 8px; border-radius: 4px; cursor: pointer;">Install</button>
        </div>
      `;
      document.body.appendChild(banner);

      document.getElementById('installBtn')?.addEventListener('click', () => {
        this.deferredPrompt?.prompt();
        banner.style.display = 'none';
      });
    } */
  }

  private showIOSInstallPrompt() {
    /* if (!this.isStandalone()) {
      const banner = document.createElement('div');
      banner.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; right: 0; background: #3880ff; color: white; padding: 12px; text-align: center; z-index: 9999; font-size: 14px;">
          Install Play Grouping: Tap Share → Add to Home Screen
          <button onclick="this.parentElement.parentElement.style.display='none'" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 4px 8px; margin-left: 10px; border-radius: 4px; cursor: pointer;">✕</button>
        </div>
      `;
      document.body.appendChild(banner);
    } */
  }
}