import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { AuthenticationService } from './authentication-service';

@Injectable()
export class Errorinterceptor {
      // MENSAGENS DE ALERTA
    horizontalPosition: MatSnackBarHorizontalPosition = 'end';
    verticalPosition: MatSnackBarVerticalPosition = 'bottom';
    constructor(
                private authenticationService: AuthenticationService,
                private snackBar: MatSnackBar) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            const error = err.error.message || err.statusText;

            if (err.statusText == 'Unauthorized') {
                // efetuar logout se o servidor retornar 401
                this.authenticationService.logout();
                //location.reload();
               // this.openSnackBar('Usuário ou senha inválidos.');
            }

            if(err.statusText == 'Unknown Error'){
              return throwError('Sistema indisponível.');
            } else {
              return throwError(error);
            }
        }))
    }

    openSnackBar(mensagem: string) {
        this.snackBar.open(mensagem, '', {
          duration: 6000,
          panelClass: ["custom-style"],
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
        });
      }
}
