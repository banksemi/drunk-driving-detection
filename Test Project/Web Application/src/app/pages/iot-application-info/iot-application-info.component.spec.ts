import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IotApplicationInfoComponent } from './iot-application-info.component';

describe('IotApplicationInfoComponent', () => {
  let component: IotApplicationInfoComponent;
  let fixture: ComponentFixture<IotApplicationInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IotApplicationInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IotApplicationInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
