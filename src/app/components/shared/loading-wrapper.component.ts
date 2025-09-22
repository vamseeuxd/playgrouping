import { Component, Input, inject } from '@angular/core';
import { LoadingController } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { APP_CONSTANTS } from '../../constants/app.constants';

@Component({
  selector: 'app-loading-wrapper',
  template: `<ng-content></ng-content>`,
  imports: [CommonModule]
})
export class LoadingWrapperComponent {
  private loadingController = inject(LoadingController);
  private currentLoading: HTMLIonLoadingElement | null = null;
  constants = APP_CONSTANTS;

  async showLoading(message: string = this.constants.MESSAGES.LOADING.DEFAULT) {
    if (this.currentLoading) {
      await this.currentLoading.dismiss();
    }
    
    this.currentLoading = await this.loadingController.create({ message });
    await this.currentLoading.present();
  }

  async hideLoading() {
    if (this.currentLoading) {
      await this.currentLoading.dismiss();
      this.currentLoading = null;
    }
  }
}