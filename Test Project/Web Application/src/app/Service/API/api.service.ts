import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HTTPService } from '../HttpService/httpservice.service';
import { ApiResult } from './api.result';
import { Subject } from 'rxjs';
import { NbToastrService } from '@nebular/theme';

@Injectable({
  providedIn: 'root',
})
export class APIService {

  public serverName;
  public footerMessage;

  constructor(private router: Router, private http: HTTPService, private toastr: NbToastrService) { 
    this.UpdateServerInformation();

  }

  public CreateResult(sub: Subject<any>)
  {
    const result = new ApiResult(this.router, sub);
    return result;
  }

  public Login(id, password): ApiResult
  {
    const formdata = new FormData();
    formdata.append('id', id);
    formdata.append('password', password);

    const result = this.CreateResult(this.http.post('https://gp-api.easylab.kr/Login.php', formdata));
    result.AddMessage(this.toastr);
    return result;
  }

  public UpdateServerInformation()
  {
    const result = this.CreateResult(this.http.get('https://gp-api.easylab.kr/GetServerInfo.php'));
    result.subscribe(data=>{
      this.serverName = data.server_info.site_name;
      this.footerMessage = data.server_info.footer_message;
    });
  }

  public Logout(): ApiResult
  {
    const result = this.CreateResult(this.http.get('https://gp-api.easylab.kr/Logout.php'));
    return result;
  }

  public GetUserInfo(): ApiResult
  {
    const result = this.CreateResult(this.http.get('https://gp-api.easylab.kr/GetUserInfo.php'));
    return result;
  }

  public GetApplicationList(): ApiResult
  {
    const result = this.CreateResult(this.http.get('https://gp-api.easylab.kr/iot/GetApplicationList.php'));
    return result;
  }

  public GetApplicationInfo(name): ApiResult
  {
    const result = this.CreateResult(this.http.get('https://gp-api.easylab.kr/iot/GetApplicationInfo.php?application_name=' + name));
    return result;
  }

  public GetIOTValueList(name): ApiResult
  {
    const result = this.CreateResult(this.http.get('https://gp-api.easylab.kr/iot/GetValueList.php?application_name=' + name));
    return result;
  }

  public IOTSend(token, key, value): ApiResult
  {
    const formdata = new FormData();
    formdata.append('value', value);
    formdata.append('device', 'Web API');

    const result = this.CreateResult(this.http.post('https://gp-api.easylab.kr/iot/DataStream.php?token=' + token + '&key=' + key, formdata));

    return result;
  }

  public CreateApplication(name, description = null, template = null, emptyLayout = false)
  {
    const formdata = new FormData();
    formdata.append('application_name', name);

    if (description != null)
      formdata.append('description', description);

    if (template != null)
      formdata.append('template', template);

      
    formdata.append('empty_layout', String(emptyLayout));

    const result = this.CreateResult(this.http.post('https://gp-api.easylab.kr/iot/CreateApplication.php', formdata));
    result.AddMessage(this.toastr);
    return result;
  }

  public ChangeLayout(name, json)
  {
    const formdata = new FormData();
    formdata.append('application_name', name);

    formdata.append('layout', JSON.stringify(json));

    const result = this.CreateResult(this.http.post('https://gp-api.easylab.kr/iot/ChangeLayout.php', formdata));
    result.AddMessage(this.toastr);
    return result;

  }

  public LayoutAddComponent(name, count)
  {
    const formdata = new FormData();
    formdata.append('application_name', name);

    formdata.append('type', 'add');
    formdata.append('count', count);

    const result = this.CreateResult(this.http.post('https://gp-api.easylab.kr/iot/ChangeLayout.php', formdata));
    result.AddMessage(this.toastr);
    return result;
  }

  public LayoutModifyComponent(name, createTime, component)
  {
    const formdata = new FormData();
    formdata.append('application_name', name);

    formdata.append('type', 'modify');
    formdata.append('createTime', createTime);
    formdata.append('component', JSON.stringify(component));

    const result = this.CreateResult(this.http.post('https://gp-api.easylab.kr/iot/ChangeLayout.php', formdata));
    result.AddMessage(this.toastr);
    return result;
  }

  public LayoutDeleteComponent(name, createTime)
  {
    const formdata = new FormData();
    formdata.append('application_name', name);

    formdata.append('type', 'delete');
    formdata.append('createTime', createTime);

    const result = this.CreateResult(this.http.post('https://gp-api.easylab.kr/iot/ChangeLayout.php', formdata));
    result.AddMessage(this.toastr);
    return result;
  }

  public DeleteApplication(name)
  {
    const formdata = new FormData();
    formdata.append('application_name', name);

    const result = this.CreateResult(this.http.post('https://gp-api.easylab.kr/iot/DeleteApplication.php', formdata));
    result.AddMessage(this.toastr);
    return result;
  }
}
