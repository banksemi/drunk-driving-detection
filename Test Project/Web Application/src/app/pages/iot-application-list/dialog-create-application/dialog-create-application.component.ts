import { Component } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { APIService } from '../../../Service/API/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-dialog-create-application',
  templateUrl: 'dialog-create-application.component.html',
  styleUrls: ['dialog-create-application.component.scss'],
})
export class DialogCreateApplicationComponent {

  public selectedItem = "default";
  public EmptyLayout = false;
  constructor(protected ref: NbDialogRef<DialogCreateApplicationComponent>, private api : APIService, private router: Router) {}

  cancel() {
    this.ref.close();
  }
  toggleEmptyLayout(event)
  {
    this.EmptyLayout = event;
  }
  submit(name) {
    var de = null;
    this.api.CreateApplication(name, de, this.selectedItem, this.EmptyLayout).subscribe(
      data=>
      {
        this.ref.close(name);
        this.router.navigate(["/pages/application/" + data.application_name]);
      }
    )
  }
}
