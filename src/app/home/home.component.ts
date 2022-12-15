import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../class/authentication-service';
import { User } from '../class/user';
import {AfterViewInit,  ViewChild } from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ClienteComponent } from './cliente/cliente.component';
import { HeaderServiceService } from '../service/header-service.service';
import { ClientesService } from '../service/clientes.service';

export interface Clientes {
  CODIGO: string;
  NOME: string;  
}
  
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  currentUser: User;
  displayedColumns: string[] = ['CODIGO', 'NOME', 'remove'];
  dataSource: MatTableDataSource<Clientes>;
  sidenavWidth = 6;
  ngStyle: string;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private router : Router, 
    private authenticationService: AuthenticationService,
    private dialog: MatDialog,
    private headerService: HeaderServiceService,
    private clientes: ClientesService ) {
      this.currentUser = this.authenticationService.currentUserValue;  

      // Assign the data to the data source for the table to render
      //this.dataSource = new MatTableDataSource(users);
    }

  async ngOnInit(): Promise<void> {
    if(!this.currentUser){
      this.router.navigate(['login']);
    } else {
      this.router.navigate(['home']);
    } 

    await this.buscarClientes();
  }

  async buscarClientes(){
      this.clientes.getClientes().subscribe(clientesRet =>{ 
        this.dataSource = new MatTableDataSource<Clientes>(clientesRet);
        this.ngAfterViewInit();
      }, err => {
        this.sair();
      })
  }

  increase() {
    this.sidenavWidth = 15; 
  }
  decrease() {
    this.sidenavWidth = 6; 
  }

  incluirCliente(){
    this.headerService.setTitle('NOVO - Cliente');
    const dialogRef = this.dialog.open(ClienteComponent, {
      width: '60cm' 
    })
    dialogRef.disableClose = true;
    dialogRef.afterClosed().subscribe(result => { 
      window.location.reload();
    });
  }

  editarCliente(cliente: any){
    this.headerService.setTitle('EDITAR - Cliente');
    const dialogRef = this.dialog.open(ClienteComponent, {
      width: '60cm',
      data: cliente
    })
    dialogRef.disableClose = true;
    dialogRef.afterClosed().subscribe(result => { 
      window.location.reload();
    });
  }


  sair(){
    this.authenticationService.logout();
     this.router.navigate(['login']);
  }

  remove(id: any){

  }

  ngAfterViewInit() {
    if(this.dataSource){
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    } 
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

} 