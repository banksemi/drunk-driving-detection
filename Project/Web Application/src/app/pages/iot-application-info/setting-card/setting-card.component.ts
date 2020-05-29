import { Component, Input, Output, OnInit } from '@angular/core';
import {
  EventEmitter
} from '@angular/core';
import { APIService } from '../../../Service/API/api.service';
import { ValueTransformer } from '@angular/compiler/src/util';

@Component({
  selector: 'ngx-setting-card',
  styleUrls: ['./setting-card.component.scss'],
  templateUrl: './setting-card.component.html'
})
export class SettingCardComponent implements OnInit {

  public CardSize: string = "null";
  public Title: string = "";
  public ValueName: string;
  public Mode: string = "getLastData";
  public Group: string = null;
  public Values = [];

  public Min: string = "";
  public Max: string = "";
  @Input() values;
  @Input() name;
  @Output() onFinish = new EventEmitter<any>();


  ngOnInit(): void {
    this.value_push();
    this.ChangeMode();
  }

  value_push() {
    this.Values.push({
      name: ''
    });
    this.ChangeGroup();
  }
  value_pop(i) {
    this.Values.splice(i, 1);
  }

  finish() {
    // 옵션 재검사
    this.ChangeMode();

    this.DeleteEmptyValues();

    if (this.Values[0]['name'] == '')
      return;

    var component = {};
    if (this.CardSize != 'null')
      component["cardSize"] = this.CardSize;

    if (this.Title.length > 0)
      component["name"] = this.Title;

    if (this.Min.length > 0)
      component["min"] = this.Min;

    if (this.Max.length > 0)
      component["max"] = this.Max;

    component["mode"] = this.Mode;

    this.Values.forEach(element => {
      if (element['label'] == '') {
        delete (element['label']);
      }
    });

    if (this.Group != null)
      component["group"] = this.Group;
    component["value"] = this.Values;
    this.onFinish.next(component);
  }

  ChangeGroup() {
    // 그룹 옵션이 변경되어야할 때 (변수 추가되거나, 그룹 옵션 변경 혹은 그룹핑 불가 옵션)
    if (this.Group == null || this.Group == 'each') {
      this.Values.forEach(element => {
        if (element['method'] != undefined) {
          delete (element['method']);
        }
      });
    }
    else {
      this.Values.forEach(element => {
        if (element['method'] == null) {
          element['method'] = "count";
        }
      });
    }
  }

  ChangeMode() {
    var Mode = this.Mode;
    if (Mode == 'getLastData' || Mode == 'list' || Mode == 'barChart') {
      if (this.Group == null)
        this.Group = "each";
    }
    else {
      this.Group = null;
    }

    this.ChangeGroup();

    if (this.Mode != "barChart") {
      this.Values.forEach(element => {
        if (element['label'] != undefined) {
          delete (element['label']);
        }
      });
    }
    if (this.Mode != "pieGraph") {
      this.Max = "";
      this.Min = "";
    }
  }

  public DeleteEmptyValues() {
    var end = false;
    do {
      end = true;
      for (var i = 1; i < this.Values.length; i++) {
        if (this.Values[i]['name'] == '') {
          end = false;
          this.value_pop(i);
          break;
        }
      }
    } while (!end);
  }
}
