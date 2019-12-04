import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomDialogueComponent } from './room-dialogue.component';

describe('RoomDialogueComponent', () => {
  let component: RoomDialogueComponent;
  let fixture: ComponentFixture<RoomDialogueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoomDialogueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomDialogueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
