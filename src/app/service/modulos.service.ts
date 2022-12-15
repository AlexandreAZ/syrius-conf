import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ModulosService {

  readonly apiURL = environment.apiUrl;
  readonly modulos = 'API/modulos'

  constructor(private httpClient: HttpClient,
    public snackbar: MatSnackBar) { }

  //função que retorna os modulos do sistema
  getModulosInterno() {
    return this.httpClient.get<any[]>(`${this.apiURL}/${this.modulos}` );
  }

  getModulos(cliente: any) {
    return this.httpClient.get<any[]>(`${this.apiURL}/${this.modulos}/${cliente}` );
  }

  getModulosID(id: any) {
    return this.httpClient.get<any[]>(`${this.apiURL}/${this.modulos}/${id}` );
  }

  
}

//Interface dos modulos
export interface Modulo { 
  nome: string; 
  enabled: number;
}