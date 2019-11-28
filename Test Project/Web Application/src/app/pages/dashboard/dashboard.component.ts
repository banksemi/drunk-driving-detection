import { Component } from '@angular/core';
import { APIService } from '../../Service/API/api.service';

@Component({
  selector: 'ngx-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  constructor(public api: APIService)
  {
    this.api.GetUserInfo();
  }
}
