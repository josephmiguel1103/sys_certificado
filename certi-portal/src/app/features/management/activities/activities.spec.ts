import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivitiesComponent } from './activities';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivityService, Activity } from '../../../core/services/activity';
import { of } from 'rxjs';

describe('ActivitiesComponent', () => {
  let component: ActivitiesComponent;
  let fixture: ComponentFixture<ActivitiesComponent>;
  let activityServiceSpy: jasmine.SpyObj<ActivityService>;

  beforeEach(async () => {
    activityServiceSpy = jasmine.createSpyObj('ActivityService', ['getActivities', 'createActivity', 'updateActivity', 'deleteActivity']);
    activityServiceSpy.getActivities.and.returnValue(of([
      { id: 1, name: 'Activity 1', type: 'course', is_active: true },
      { id: 2, name: 'Activity 2', type: 'event', is_active: false }
    ]));

    await TestBed.configureTestingModule({
      imports: [ActivitiesComponent, FormsModule, ReactiveFormsModule],
      providers: [
        { provide: ActivityService, useValue: activityServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load activities on init', () => {
    const mockActivities: Activity[] = [
      { id: 1, name: 'Activity 1', type: 'course', is_active: true },
      { id: 2, name: 'Activity 2', type: 'event', is_active: false }
    ];
    activityServiceSpy.getActivities.and.returnValue(of(mockActivities));

    component.ngOnInit();

    expect(activityServiceSpy.getActivities).toHaveBeenCalled();
  });
});
