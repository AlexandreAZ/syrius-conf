import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AcessosService {

  readonly apiURL = environment.apiUrl;
  readonly acessos = 'API/usuarios'

  constructor(private httpClient: HttpClient,
    public snackbar: MatSnackBar) { }

  //função que retorna os modulos do sistema  
  getAcessos(cliente: any) {
    return this.httpClient.get<any[]>(`${this.apiURL}/${this.acessos}/${cliente}` );
  }

  getAcessosID(id: any) {
    return this.httpClient.get<any[]>(`${this.apiURL}/${this.acessos}/${id}` );
  }
}
