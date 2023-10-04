import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavigationHelpComponent } from './navigation-help.component';

describe('NavigationHelpComponent', () => {
  let component: NavigationHelpComponent;
  let fixture: ComponentFixture<NavigationHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NavigationHelpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavigationHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
