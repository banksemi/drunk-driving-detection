import { Component, OnInit, OnDestroy } from '@angular/core';
import { APIService } from '../../Service/API/api.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NbThemeService, NbColorHelper } from '@nebular/theme';
import { takeWhile } from 'rxjs/operators';
import { isNgTemplate } from '@angular/compiler';
import {_} from "underscore";

@Component({
  selector: 'iot-application-info',
  templateUrl: './iot-application-info.component.html',
  styleUrls: ['./iot-application-info.component.scss']
})
export class IotApplicationInfoComponent implements OnInit, OnDestroy {

  public ManagementMode = false;

  public valueUpdateTimer = {};
  public timer;

  public id;
  public data = null;

  public theme: any;
  private alive = true;
  private updating_value = 0;
  private colors = [];

  public IOTValues = {};
  constructor(private api: APIService, private route: ActivatedRoute, private themeService: NbThemeService, private router: Router) {
    this.themeService.getJsTheme()
      .pipe(takeWhile(() => this.alive))
      .subscribe(config => {
        this.colors = [];
        this.colors.push(NbColorHelper.hexToRgbA(config.variables.primaryLight, 0.8));
        this.colors.push(NbColorHelper.hexToRgbA(config.variables.infoLight, 0.8));
        this.colors.push(NbColorHelper.hexToRgbA(config.variables.dangerLight, 0.8));
        this.colors.push(NbColorHelper.hexToRgbA(config.variables.successLight, 0.8));
        this.theme = config.variables.temperature;
      });
    this.id = route.snapshot.params['id'];
    this.Update();
    this.timer = setInterval(() => {
      this.Update();
    }, 1000);

    this.api.GetIOTValueList(this.id).subscribe(
      data=>{
        this.IOTValues = _.groupBy(data.list, value => value.type);
        console.log(this.IOTValues);
      }
    )
  }

  public parseInt(value)
  {
    return parseInt(value);
  }

  public valueUpdate(key, value) {
    var delay = 0;
    var input_value : any = value;
    if (typeof value == "number")
    {
      delay = 200;
      input_value = value.toFixed(1);
    }
    if (this.valueUpdateTimer[key] != null) {
      clearTimeout(this.valueUpdateTimer[key]);
      this.valueUpdateTimer[key] = null;
    }
    this.valueUpdateTimer[key] = setTimeout(() => {
      this.updating_value += 1;
      this.api.IOTSend(this.data.token, key, input_value).subscribe(
        data=>{this.updating_value -= 1;},
        error=>{this.updating_value -= 1;}
      );
      this.valueUpdateTimer[key] = null;
    }, delay);
  }

  public LayoutUpdate(new_layout, force = false)
  {
    for (var i = 0; i < this.data.layout.length; i++) {
      for (var j = 0; j < this.data.layout[i].length; j++) {
        var pass = false;
        this.data.layout[i][j].value.forEach(element => {
          if (this.valueUpdateTimer[element.name] != null)
          {
            pass = true;
          }
        });
        if (pass) continue;
        if (JSON.stringify(this.data.layout[i][j].data) != JSON.stringify(new_layout[i][j].data) || force)
        {
          this.data.layout[i][j].data = new_layout[i][j].data;

          if (new_layout[i][j].mode == "barChart")
          {
            var datas = new_layout[i][j].data;
            var clabels = [];
            var cdatas = [];
            datas.forEach(data => {
              cdatas.push([]);
              data.forEach(element => {
                if (!clabels.includes(element.datetime))
                  clabels.push(element.datetime);
              });
            });

            clabels.sort();
            for(var t= 0; t < datas.length; t++)
            {
              clabels.forEach(label => {
                var findi = -1;
                for(var g= 0; g < datas[t].length; g++)
                {
                  if (datas[t][g].datetime == label)
                  {
                    findi = g;
                    break;
                  }
                }
                if (findi == -1)
                {
                  cdatas[t].push(0);
                }
                else
                {
                  cdatas[t].push(datas[t][findi].value);
                }
              });
            }

            var new_data =  {
              labels: clabels,
              datasets: []
            };

            var t = 0;
            for(var t = 0; t < datas.length; t++)
            {
              new_data.datasets.push(
                {
                  data: cdatas[t],
                  label: new_layout[i][j].value[t].label ? new_layout[i][j].value[t].label : new_layout[i][j].value[t].name,
                  backgroundColor: this.colors[t]
                }
              )
            }

            var options = {
              responsive: true,
              maintainAspectRatio: false
            };

            this.data.layout[i][j].options = options;
            this.data.layout[i][j].chartData = new_data;
          }
      }

        }
    }
  }
  public Update() {
    this.api.GetApplicationInfo(this.id).subscribe(
      getData => {
        if (this.updating_value > 0) return;
        var first = false;
        if (this.data == null) 
        {
          this.data = getData;
          this.LayoutUpdate(getData.layout, true);
          first = true;
        }
        else
          this.LayoutUpdate(getData.layout);

      }
    );
  }

  public AddLayout(count = 1)
  {
    this.api.LayoutAddComponent(this.data.application_name, count).subscribe(
      message=>{
        this.data.layout = message.layout;
        this.LayoutUpdate(message.layout, true);
      }
    );
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    clearInterval(this.timer);
    this.alive = false;
  }

  public settingCard(createTime, component)
  {
    this.api.LayoutModifyComponent(this.data.application_name, createTime, component).subscribe(
      message=>{
        this.data.layout = message.layout;
        this.LayoutUpdate(message.layout, true);
      }
    );
  }

  public DeleteApplication()
  {
    var input = prompt("어플리케이션을 삭제하시려면 아래에 '" + this.id + "'을 입력해주세요.");
    if (input === this.id)
    {
      this.api.DeleteApplication(this.data.application_name).subscribe(
        message=>{
          this.router.navigate(["/pages/application"]);
        }
      );
    }
    else if (input != null)
    {
      alert("삭제 확인 메세지를 올바르게 입력하지 않았습니다.");
    }
  }

  public DeleteComponent(createTime)
  {
    this.api.LayoutDeleteComponent(this.data.application_name, createTime).subscribe(
      message=>{
        this.data.layout = message.layout;
        this.LayoutUpdate(message.layout, true);
      }
    );
  }
}
