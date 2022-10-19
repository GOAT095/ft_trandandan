import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApiService } from '../api.service';

import { TwoFactorCheckComponent } from './two-factor-check.component';

describe('TwoFactorCheckComponent', () => {
  let component: TwoFactorCheckComponent;
  let fixture: ComponentFixture<TwoFactorCheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      //imports: [ApiService],
      imports: [HttpClientTestingModule],
      declarations: [ TwoFactorCheckComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TwoFactorCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
