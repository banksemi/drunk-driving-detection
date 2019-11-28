import { Component } from '@angular/core';
import { TimeFormat } from '../../time-format';
import { APIService } from '../../Service/API/api.service';
import { NbDialogService } from '@nebular/theme';
import { DialogCreateApplicationComponent } from './dialog-create-application/dialog-create-application.component';

@Component({
  selector: 'iot-application-list',
  templateUrl: './iot-application-list.component.html',
  styleUrls: ['./iot-application-list.component.scss'],
})
export class IotApplicationListComponent {
  public list = [];
  constructor(public api: APIService, public dialogService: NbDialogService) {
    this.api.GetApplicationList().subscribe(
      (data) => {
        this.list = data['list'];
      },
    );
  }


  public open_create_application() {
    this.dialogService.open(DialogCreateApplicationComponent);
  }

  public timeFormat(date) {
    if (date == null)
      return '정보 없음';
    return TimeFormat.formatTimeString(new Date(date));
  }
}
