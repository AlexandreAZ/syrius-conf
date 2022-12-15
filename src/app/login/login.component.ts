import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, Validators  } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { AuthenticationService } from '../class/authentication-service';
import { User } from 'src/app/class/user';
import { AlertService } from 'src/app/service/alert.service';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  _headers = new HttpHeaders({'Access-Control-Allow-Origin':'*'});
  horizontalPositionErro: MatSnackBarHorizontalPosition = 'center';
  verticalPositionErro: MatSnackBarVerticalPosition = 'top';

  password!: string;
  erro!: string;
  user!: string;
  loading = false;
  submitted = false;

  readonly apiURL : string | undefined
  currentUser: User;
  dataAutal: Date = new Date();
  loginForm!: FormGroup;

  constructor( private router: Router,
               private _snackBar: MatSnackBar,
               private http: HttpClient,
               private formBuilder: FormBuilder,
               private authentication: AuthenticationService,
               private alertService: AlertService ) {
               this.currentUser = this.authentication.currentUserValue;
               this.loginForm = this.formBuilder.group({
                username: ['', Validators.required],
                password: ['', Validators.required]
              });
              }

   // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }
  ngOnInit(): void {
    try { 
      this.loginForm = this.formBuilder.group({
        username: ['', Validators.required],
        password: ['', Validators.required]
      });
        if(!this.currentUser){
          this.router.navigate(['login']);
        } else {
          this.router.navigate(['home']);
        } 
     
    } catch (error: any) {
      console.log(error);
      if(error){
        this.alertErro(error);
      } 
    }
  }

  change(event: any) {
    event.target.value = this.dataAutal;
  }

  submit(){
    try { 
      if (this.loginForm.invalid) {
           
      } else {
        this.loading = true;
        this.authentication
        .login(this.f.username.value, this.f.password.value)
        .subscribe(data => { 
          if(data)
          this.router.navigate(['home']);
          console.log(data)
        }, error => {
          console.log(error)
          this.alertService.error(error);
          this.erro = error;
          this.loading = false;
        }); 
      }
      
    } catch (error) {
      console.log(error); 
      //this.alertErro(error);
    }
  }

  onSubmit(){
    try {
      this.submitted = true;
      if (this.loginForm.invalid) {
          return;
      }
      this.loading = true;
      this.authentication
      .login(this.f.username.value, this.f.password.value)
      .subscribe(data => {
        this.router.navigate(['home']);
        console.log(data)
      }, error => {
        this.alertService.error(error);
        this.erro = error;
        this.loading = false;
      });
    } catch (error) {
      console.log(error);
      //this.alertErro(error);
    }
  }

  alertErro(mensagem: string) {
    this._snackBar.open(mensagem, 'Fechar', {
      panelClass: ["erro-style"],
      horizontalPosition: this.horizontalPositionErro,
      verticalPosition: this.verticalPositionErro,
    });
  }

}
