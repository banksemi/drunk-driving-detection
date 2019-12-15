import { NgModule } from '@angular/core';
import { NbMenuModule, NbCardModule, NbListModule, NbButtonModule, NbInputModule, NbSelectModule } from '@nebular/theme';
import { ChartModule } from 'angular2-chartjs';

import { ThemeModule } from '../@theme/theme.module';
import { PagesComponent } from './pages.component';
import { DashboardModule } from './dashboard/dashboard.module';
import { PagesRoutingModule } from './pages-routing.module';
import { IotApplicationListComponent } from './iot-application-list/iot-application-list.component';
import { IotApplicationInfoComponent } from './iot-application-info/iot-application-info.component';
import { TemperatureDraggerComponent } from './iot-application-info/temperature-dragger/temperature-dragger.component';
import { StatusCardComponent } from './iot-application-info/status-card/status-card.component';
import { SettingCardComponent } from './iot-application-info/setting-card/setting-card.component';
import { IotComponent } from './iot/iot.component';

@NgModule({
  imports: [
    PagesRoutingModule,
    ThemeModule,
    NbMenuModule,
    DashboardModule,
    NbCardModule,
    NbListModule,
    NbButtonModule,
    ChartModule,
    NbButtonModule,
    NbInputModule,
    NbSelectModule,
  ],
  declarations: [
    PagesComponent,
    IotApplicationListComponent,
    IotApplicationInfoComponent,
    TemperatureDraggerComponent,
    StatusCardComponent,
    SettingCardComponent,
    IotComponent
  ],
})
export class PagesModule {
}
