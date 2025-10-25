import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivityService } from './activity';
import { environment } from '../../../environments/environment';

describe('ActivityService', () => {
  let service: ActivityService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(ActivityService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get activities', () => {
    const mockResponse = {
      success: true,
      message: 'OK',
      data: {
        activities: [
          { id: 1, name: 'Activity 1', status: 'active', type: 'course', is_active: true },
          { id: 2, name: 'Activity 2', status: 'inactive', type: 'workshop', is_active: false }
        ]
      }
    };

    service.getActivities().subscribe(activities => {
      expect(activities.length).toBe(2);
      expect(activities[0].name).toBe('Activity 1');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/activities`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});
