import { Injectable } from '@angular/core';
import { HTTPService } from '../HttpService/httpservice.service';
import { APIService } from '../API/api.service';

@Injectable({
  providedIn: 'root',
})
export class UserInfoService {

  public data = {};

  public get branch_name() { return this.data['branch_name']; }
  public get name() { return this.data['name']; }
  constructor(hs: HTTPService, public api: APIService) {
    this.Update();
  }

  public Update()
  {
    this.api.GetUserInfo().subscribe(
      (data) => {
        this.data = data;
      },
      (error) => {},
    );
  }

}
