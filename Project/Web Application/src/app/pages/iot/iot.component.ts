import { Component } from '@angular/core';
import { TimeFormat } from '../../time-format';
import { APIService } from '../../Service/API/api.service';
import { NbDialogService } from '@nebular/theme';

@Component({
  selector: 'iot',
  templateUrl: './iot.component.html',
  styleUrls: ['./iot.component.scss'],
})
export class IotComponent {
  public list = [];
  constructor(public api: APIService, public dialogService: NbDialogService) {

    this.api.GetApplicationList().subscribe(
      (data) => {
        this.list = data['list'];
      },
    );
  }

  public get global() {
    var data = (<HTMLInputElement>document.getElementById("key")).value;
    if (data == null || data == "")
      return null;
    var arr =  JSON.parse(data);
    return arr.sort(function(a,b){ return b["index"]-a["index"]});
  }

  public timeFormat(date) {
    if (date == null)
      return '정보 없음';
    return TimeFormat.formatTimeString(new Date(date));
  }
}
