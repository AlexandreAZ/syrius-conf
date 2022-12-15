import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  readonly apiURL = environment.apiUrl;
  readonly clientes = 'API/clientes'
  readonly usuarioAdd = 'API/clientes/add/'
  readonly usuarioUpdate = 'API/clientes/update/'

  constructor(private httpClient: HttpClient,
    public snackbar: MatSnackBar) { }

  //função que retorna os clientes na consulta inicial
  getClientes() {
    return this.httpClient.get<any[]>(`${this.apiURL}/${this.clientes}` );
  }

  incluirCliente(dados: any){
    return this.httpClient.post<any>(`${this.apiURL}/${this.usuarioAdd}`, dados);
  }

  atualizarCliente(dados: any){
    return this.httpClient.post<any>(`${this.apiURL}/${this.usuarioUpdate}`, dados);
  }

  showMessage(message: string, action: string) {
    this.snackbar.open(message, action, {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      panelClass: ['snackbar-success']
    });
  }

}
