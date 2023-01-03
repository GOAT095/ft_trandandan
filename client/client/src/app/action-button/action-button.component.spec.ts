import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApiService } from '../api.service';
import { Dialog, DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { Overlay } from '@angular/cdk/overlay';
import { DIALOG_SCROLL_STRATEGY_PROVIDER } from '@angular/cdk/dialog';

import { ActionButtonComponent, PromptDialogComponent } from './action-button.component';

describe('ActionButtonComponent', () => {
  let component: ActionButtonComponent;
  let fixture: ComponentFixture<ActionButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [Dialog, Overlay, DIALOG_SCROLL_STRATEGY_PROVIDER],
      declarations: [ PromptDialogComponent,ActionButtonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
