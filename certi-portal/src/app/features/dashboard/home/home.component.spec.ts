import { TestBed, ComponentFixture } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from '../../../core/services/auth.service';
import { computed } from '@angular/core';
import { User } from '../../../core/models/user.model';
import { environment } from '../../../../environments/environment';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let httpMock: HttpTestingController;
  let authServiceStub: Partial<AuthService>;

  beforeEach(async () => {
    authServiceStub = {
      currentUser: computed(() => ({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        created_at: '2025-10-24T00:00:00.000Z',
        updated_at: '2025-10-24T00:00:00.000Z'
      } as User))
    };

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        HomeComponent
      ],
      providers: [{ provide: AuthService, useValue: authServiceStub }]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    // ❌ NO llamar a detectChanges() aquí todavía
    // fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();

    // ✅ Ahora sí llamamos detectChanges y manejamos las peticiones del ngOnInit
    fixture.detectChanges();

    // Manejar las peticiones automáticas del ngOnInit
    const reqUsers = httpMock.expectOne(`${environment.apiUrl}/users?per_page=1000`);
    reqUsers.flush({ success: true, message: '', data: { users: [] } });

    const reqCerts = httpMock.expectOne(`${environment.apiUrl}/certificates?per_page=1000`);
    reqCerts.flush({ success: true, message: '', data: { certificates: [] } });
  });

  it('should load users and certificates from API', () => {
    const mockUsers = [
      { id: 1, name: 'User 1', email: 'u1@test.com', created_at: '2025-10-01', updated_at: '2025-10-01' }
    ];

    const mockCertificates = [
      {
        id: 1,
        unique_code: 'C1',
        activity_name: 'Cert 1',
        user_name: 'User 1',
        fecha_emision: '2025-10-01',
        status: 'issued'
      }
    ];

    // ✅ Llamar detectChanges para que se ejecute ngOnInit
    fixture.detectChanges();

    // ✅ Ahora manejamos las peticiones que se disparan automáticamente
    const reqUsers = httpMock.expectOne(`${environment.apiUrl}/users?per_page=1000`);
    expect(reqUsers.request.method).toBe('GET');
    reqUsers.flush({ success: true, message: '', data: { users: mockUsers } });

    const reqCerts = httpMock.expectOne(`${environment.apiUrl}/certificates?per_page=1000`);
    expect(reqCerts.request.method).toBe('GET');
    reqCerts.flush({ success: true, message: '', data: { certificates: mockCertificates } });

    // ✅ Verificar que los datos se cargaron
    expect(component.users()).toEqual(mockUsers);
    expect(component.certificates()).toEqual(mockCertificates);
    expect(component.recentCertificates().length).toBeLessThanOrEqual(5);
  });

  it('should compute activeCertificates correctly', () => {
    // ✅ No llamamos a detectChanges para evitar el ngOnInit
    component.certificates.set([
      {
        id: 1,
        unique_code: 'A1',
        activity_name: 'Act1',
        user_name: 'User1',
        fecha_emision: '2025-10-01',
        status: 'issued'
      },
      {
        id: 2,
        unique_code: 'A2',
        activity_name: 'Act2',
        user_name: 'User2',
        fecha_emision: '2025-10-01',
        status: 'inactive'
      }
    ]);

    expect(component.activeCertificates().length).toBe(1);
    expect(component.activeCertificates()[0].unique_code).toBe('A1');
  });

  it('should compute thisMonthCertificates correctly', () => {
    const currentDate = new Date();
    const currentMonth = currentDate.toISOString().slice(0, 7); // "2025-10"
    const lastMonth = new Date(currentDate.setMonth(currentDate.getMonth() - 1))
      .toISOString().slice(0, 7);

    component.certificates.set([
      {
        id: 1,
        unique_code: 'C1',
        activity_name: 'Act1',
        user_name: 'User1',
        fecha_emision: `${currentMonth}-15`,
        status: 'issued'
      },
      {
        id: 2,
        unique_code: 'C2',
        activity_name: 'Act2',
        user_name: 'User2',
        fecha_emision: `${lastMonth}-15`,
        status: 'issued'
      }
    ]);

    expect(component.thisMonthCertificates().length).toBe(1);
    expect(component.thisMonthCertificates()[0].unique_code).toBe('C1');
  });

  it('should format dates correctly', () => {
    const formatted = component.formatDate('2025-10-24');
    expect(formatted).toContain('2025');
    expect(formatted.toLowerCase()).toMatch(/octubre|october/); // Depende del locale
  });
});
