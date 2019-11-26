import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IotApplicationListComponent } from './iot-application-list.component';

describe('IotApplicationListComponent', () => {
  let component: IotApplicationListComponent;
  let fixture: ComponentFixture<IotApplicationListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IotApplicationListComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IotApplicationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
