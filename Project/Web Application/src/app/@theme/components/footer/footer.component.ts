import { Component } from '@angular/core';
import { APIService } from '../../../Service/API/api.service';

@Component({
  selector: 'ngx-footer',
  styleUrls: ['./footer.component.scss'],
  template: `
    <span class="created-by" [innerHTML]="message"></span>
    <div class="socials">
      <a href="#" target="_blank" class="ion ion-social-github"></a>
      <a href="#" target="_blank" class="ion ion-social-facebook"></a>
      <a href="#" target="_blank" class="ion ion-social-twitter"></a>
      <a href="#" target="_blank" class="ion ion-social-linkedin"></a>
    </div>
  `,
})
export class FooterComponent {
  public get message()
  {
    return this.api.footerMessage;
  }
  constructor(private api: APIService)
  {
    
  }
}
