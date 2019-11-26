import { Injectable } from '@angular/core';
import { Subject, Subscription, config } from 'rxjs';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { NbToastrService, NbGlobalLogicalPosition, NbComponentStatus } from '@nebular/theme';


export class ApiResult {
  private subject: Subject<any>;
  private Subscriptions = [];

  constructor(router: Router, subject?: Subject<any>) {

    this.subject = new Subject<any>();
    if (subject != null) {
      subject.subscribe(data => {
        if (data['success'] == 1) {
          this.subject.next(data);
        }
        else {
          this.subject.error(data);
        }
        if (data['success'] == -1 && router.url.indexOf("/auth/login") == -1) {
          router.navigate(['/auth/login'], { queryParams: {callback: router.url }});
        }
      });
    }
  }

  private add(value: Subscription): Subscription {
    this.Subscriptions.push(value);
    return value;
  }
  public subscribe(next, error = null): Subscription {
    if (error == null)
      return this.add(this.subject.subscribe(next));
    return this.add(this.subject.subscribe(next, error));
  }
  public unsubscribe() {
    this.Subscriptions.forEach((element: Subscription) => {
      element.unsubscribe();
    });
  }

  public AddMessage(toastrService: NbToastrService) {
    let type: NbComponentStatus;
    type = 'success';
    var config = {
      status: type,
      destroyByClick: true,
      duration: 2000,
      hasIcon: true,
      position: NbGlobalLogicalPosition.TOP_START,
      preventDuplicates: false,
    };

    type = "warning";
    var error_config = {
      status: type,
      destroyByClick: true,
      duration: 2000,
      hasIcon: true,
      position: NbGlobalLogicalPosition.TOP_START,
      preventDuplicates: false,
    };

    this.add(
      this.subject.subscribe(data => {
        if (data['message'] == null) return;
        toastrService.show('요청 성공', data['message'], config);
      }, error => {
        if (error['message'] == null) return;
        toastrService.show('요청 실패', error['message'], error_config);
      }
      ),
    );
  }

  public next(data?) {
    this.subject.next(data);
  }

  public error(code) {
    if (code instanceof HttpErrorResponse)
      this.subject.error(code);
    else {
      const return_error = <any>new Object(); // 오류 발생시 code를 적을 오브젝트
      return_error.error = [];
      return_error.error['code'] = code;
      this.subject.error(return_error);
    }
  }
}
