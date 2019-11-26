import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { APIService } from '../Service/API/api.service';
import { Router, ActivatedRoute } from '@angular/router';
import { UserInfoService } from '../Service/UserInfo/user-info.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  public form: FormGroup;
  public callback = null;
  constructor(public api: APIService, public route: ActivatedRoute, public router: Router, public userInfo :UserInfoService) {
    this.form = new FormGroup({
      id: new FormControl('', [
        Validators.required,
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
      ]),
    });
  }

  ngOnInit() {
    this.route.queryParams 
      .subscribe(params => {
        if (params.callback != null)
          this.callback = params.callback;
      });
  }

  public onSubmit(value) {
    this.api.Login(value.id, value.password).subscribe(
      () => {
        this.userInfo.Update();
        if (this.callback != null)
          this.router.navigate([this.callback]);
        else
          this.router.navigate(['/']);
      }
      ,
      (data) =>
      {
        console.log(data);
      },
    );
  }

}
