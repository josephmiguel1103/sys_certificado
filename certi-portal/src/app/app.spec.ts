import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './core/services/auth.service';

describe('App', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    // ✅ Crear un spy del AuthService para evitar llamadas reales
    authServiceSpy = jasmine.createSpyObj('AuthService', [
      'isAuthenticated',
      'isTokenValid',
      'logout'
    ]);

    // ✅ Configurar comportamiento por defecto (usuario NO autenticado)
    authServiceSpy.isAuthenticated.and.returnValue(false);
    authServiceSpy.isTokenValid.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [
        App,                       // ✅ Tu componente
        HttpClientTestingModule    // ✅ Mock de HttpClient
      ],
      providers: [
        provideRouter([]),         // ✅ Mock del Router
        { provide: AuthService, useValue: authServiceSpy }  // ✅ Mock de AuthService
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  

  it('should call isAuthenticated on init', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(authServiceSpy.isAuthenticated).toHaveBeenCalled();
  });

  it('should call isTokenValid when user is authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    authServiceSpy.isTokenValid.and.returnValue(true);

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(authServiceSpy.isTokenValid).toHaveBeenCalled();
  });

  it('should logout when user is not authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);
    authServiceSpy.isTokenValid.and.returnValue(false);

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(authServiceSpy.logout).toHaveBeenCalled();
  });

  it('should NOT logout when user is authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    authServiceSpy.isTokenValid.and.returnValue(true);

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(authServiceSpy.logout).not.toHaveBeenCalled();
  });
});
