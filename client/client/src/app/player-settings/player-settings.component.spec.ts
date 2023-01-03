import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApiService } from '../api.service';

import { PlayerSettingsComponent } from './player-settings.component';

describe('PlayerSettingsComponent', () => {
  let component: PlayerSettingsComponent;
  let fixture: ComponentFixture<PlayerSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [ PlayerSettingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
