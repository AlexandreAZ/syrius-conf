import { SelectionModel } from '@angular/cdk/collections';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';  
import { HeaderServiceService } from 'src/app/service/header-service.service';
import { ModulosService } from 'src/app/service/modulos.service';
import { MatTableDataSource } from '@angular/material/table'; 
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import cep from 'cep-promise' 
import { AcessosService } from 'src/app/service/acessos.service';
import { ClientesService } from 'src/app/service/clientes.service';

export interface PeriodicElement {
  username: string;
  type: number; 
  enabled: number;
  created: Date;
  updated: Date;
}

export interface Modulo { 
  nome: string; 
  enabled: boolean;
}

export interface Usuario{
  username: string;
  password:string;
  type: number; 
  enabled: boolean;
  created: Date; 
}
@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.component.html',
  styleUrls: ['./cliente.component.scss']
})
export class ClienteComponent implements OnInit {

  isLoading: boolean = true;
  local: any;
  dadosGeraisForm: FormGroup;
  acessosForm: FormGroup;
  dadosEndForm: FormGroup;
  submitted = false;
  erro: string;
  ativo: boolean = true;
  dataSourceAcessos: any; 
  dataSourceModulos: any;
  dataSourceMAux: any;
  displayedColumnsAcesso: string[] = ['username', 'type', 'enabled', 'created', 'updated', 'remove'];
  displayedColumnsModulos: string[] = ['nome', 'enabled', 'remove'];
  selection = new SelectionModel<Usuario>(true, []);
  selectionAcesso = new SelectionModel<PeriodicElement>(true, []);
  moduloSelecionado: any;
  modulos: any;
  modulosAux: Modulo;
  username:string;
  password:string;
  ufs: any[] = [];
  ufSelecionada: any;
  ELEMENT_DATA_USERS: Usuario[] = [];
  ELEMENT_DATA_MODULOS: Usuario[] = []; 

  @ViewChild('paginatorAcesso', { read: MatPaginator }) paginatorAcesso: MatPaginator;
  @ViewChild('paginatorModulo', { read: MatPaginator }) paginatorModulo: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(public dialogRef: MatDialogRef<ClienteComponent>,
              private formBuilder: FormBuilder,
              private headerService: HeaderServiceService,
              private modulosService: ModulosService,
              private acessosService: AcessosService,
              private clientesService: ClientesService,
              @Inject(MAT_DIALOG_DATA) public datas: any) { 

      this.ufs.push(
        { uf: 'RO', nome: 'Rondônia'},
        { uf: 'AC', nome: 'Acre'},
        { uf: 'AM', nome: 'Amazonas'},
        { uf: 'RR', nome: 'Roraima'},
        { uf: 'PA', nome: 'Pará'},
        { uf: 'AP', nome: 'Amapá'},
        { uf: 'TO', nome: 'Tocantins'},
        { uf: 'MA', nome: 'Maranhão'},
        { uf: 'PI', nome: 'Piauí'},
        { uf: 'CE', nome: 'Ceará'},
        { uf: 'RN', nome: 'Rio Grande do Norte'},
        { uf: 'PB', nome: 'Paraíba'},
        { uf: 'PE', nome: 'Pernambuco'},
        { uf: 'AL', nome: 'Alagoas'},
        { uf: 'SE', nome: 'Sergipe'},
        { uf: 'BA', nome: 'Bahia'},
        { uf: 'MG', nome: 'Minas Gerais'},
        { uf: 'ES', nome: 'Espírito Santo'},
        { uf: 'RJ', nome: 'Rio de Janeiro'},
        { uf: 'SP', nome: 'São Paulo'},
        { uf: 'PR', nome: 'Paraná'}, 
        { uf: 'SC', nome: 'Santa Catarina'},
        { uf: 'RS', nome: 'Rio Grande do Sul'},
        { uf: 'MS', nome: 'Mato Grosso do Sul'},
        { uf: 'MT', nome: 'Mato Grosso'},
        { uf: 'GO', nome: 'Goiás'},
        { uf: 'DF', nome: 'Distrito Federal'}
        )

      this.local = this.headerService.headerTitle.value;
      this.dadosGeraisForm = this.formBuilder.group({
        codigo: ['', Validators.required],
        nome: ['', Validators.required],
        cpfcgc: [''],
        endres: [''],
        bairres: [''],
        cidres: [''],
        ufres: [''],
        cepres: [''],
        fone: [''],
        email: [''],
      });
  
      this.acessosForm = this.formBuilder.group({
        username: ['', Validators.required],
        password: ['', Validators.required],
        enabled: [''],
        type: [''], 
        created: ['']
      }); }

  get f() { return this.dadosGeraisForm.controls; }
  get a() { return this.acessosForm.controls; }

  async ngOnInit(): Promise<void> {
    if(this.datas){
      //console.log(this.datas);
      this.dadosGeraisForm.controls['codigo'].disable();
      this.buscarModulos();
      this.loadDatas();
    } else {
      this.buscarModulos();
    }  

    
  }

  async loadDatas(){
    // DADOS
    this.dadosGeraisForm.controls['codigo'].setValue(this.datas['CODIGO']);
    this.dadosGeraisForm.controls['nome'].setValue(this.datas['NOME']);
    this.dadosGeraisForm.controls['email'].setValue(this.datas['EMAIL']);
    this.dadosGeraisForm.controls['fone'].setValue(this.datas['FONE']);
    // ENDEREÇO
    this.dadosGeraisForm.controls['cepres'].setValue(this.datas['CEPRES']);
    this.dadosGeraisForm.controls['endres'].setValue(this.datas['ENDRES']);
    this.dadosGeraisForm.controls['cidres'].setValue(this.datas['CIDRES']);
    this.dadosGeraisForm.controls['bairres'].setValue(this.datas['BAIRRES']);
    this.dadosGeraisForm.controls['ufres'].setValue(this.datas['UFRES']);
    // MODULOS
    await this.buscarModulosCliente(this.dadosGeraisForm.get('codigo')?.value);
    // ACESSOS
    await this.buscarAcessosCliente(this.dadosGeraisForm.get('codigo')?.value);
  }

  getCep(valor:any){ 
    cep(valor).then(ret =>{
      //console.log(ret)
      this.dadosGeraisForm.controls['endres'].setValue(ret.street);
      this.dadosGeraisForm.controls['cidres'].setValue(ret.city);
      this.dadosGeraisForm.controls['bairres'].setValue(ret.neighborhood);
      this.dadosGeraisForm.controls['ufres'].setValue(ret.state); 
    })
  }

  ngAfterViewInit() { 
    if(this.dataSourceAcessos){
      if(this.paginatorAcesso){
        this.paginatorAcesso._intl.itemsPerPageLabel="Itens por página";
        this.paginatorAcesso._intl.previousPageLabel="Anterior";
        this.paginatorAcesso._intl.nextPageLabel="Próxima";
        this.paginatorAcesso._intl.firstPageLabel="Primeira";
        this.paginatorAcesso._intl.lastPageLabel="Última";

        
        this.dataSourceAcessos.paginator = this.paginatorAcesso;
      }
    }

    if(this.dataSourceModulos){
      if(this.paginatorModulo){
        this.paginatorModulo._intl.itemsPerPageLabel="Itens por página";
        this.paginatorModulo._intl.previousPageLabel="Anterior";
        this.paginatorModulo._intl.nextPageLabel="Próxima";
        this.paginatorModulo._intl.firstPageLabel="Primeira";
        this.paginatorModulo._intl.lastPageLabel="Última";

        
        this.dataSourceModulos.paginator = this.paginatorModulo;
      }
    }
       
  }

  editarAcesso(acessoId :any){

  } 

  incluirUsuario(){

    if(!this.username){
      this.erro = 'Defina um nome para o usuario';
      return
    }  
    
    if(!this.password){
      this.erro = 'Defina uma senha para o usuario';
      return
    }  

    var list = {
      username: this.username,
      password: this.password,
      type: 0,
      enabled: this.ativo,
      created: new Date(), 
    }
    
    this.ELEMENT_DATA_USERS.push(list);

    this.dataSourceAcessos = new MatTableDataSource<Usuario>(this.ELEMENT_DATA_USERS);  
    this.username = '';
    this.password = '';
    this.erro = '';
    this.ngAfterViewInit();

  }

  incluirModulo(){
    if(this.moduloSelecionado){
   
      let ELEMENT_DATA: Modulo[] = [
        {
          nome: this.moduloSelecionado,
          enabled: this.ativo
        }
      ]; 

      this.dataSourceModulos = new MatTableDataSource<Modulo>(ELEMENT_DATA);
      this.moduloSelecionado = null
      this.erro = '';
      this.ngAfterViewInit();
    } else {
      this.erro = 'Selecione um modulo!'; 
    }
  }

  removerModulo(id: any){
    this.dataSourceModulos = this.dataSourceModulos.data.filter((element: any) => element.nome !== id);
  }

  removerAcesso(id: any){ 
    this.ELEMENT_DATA_USERS = [];  
    this.dataSourceAcessos.data = this.dataSourceAcessos.data.filter((row: any) => row.username !== id);
    this.dataSourceAcessos.data.forEach((item: any) =>{
      this.ELEMENT_DATA_USERS.push(item)
    }) 
  }
 
  // MODULOS
  async buscarModulosCliente(cliente:any){
    this.modulosService.getModulos(cliente).subscribe(modulosRet =>{   
      this.dataSourceModulos = new MatTableDataSource<Modulo>(this.keysToLowerCase(modulosRet));
      this.ngAfterViewInit(); 
    }) 

  }

  async buscarModulos(){
    this.modulosService.getModulosInterno().subscribe(modulosRet =>{  
      this.modulos = modulosRet;  
    })  
  }

  // ACESSOS
  async buscarAcessosCliente(cliente:any){ 
    this.acessosService.getAcessos(cliente).subscribe(acessosRet =>{   
      this.dataSourceAcessos = new MatTableDataSource<Usuario>(this.keysToLowerCase(acessosRet));
      this.dataSourceAcessos.data.forEach((item: any) =>{
        this.ELEMENT_DATA_USERS.push(item)
      }) 
      this.ngAfterViewInit(); 
    }) 
  }
 
  keysToLowerCase(obj:  any) {
    if(obj instanceof Array) {
        for (var i in obj) {
            obj[i] = this.keysToLowerCase(obj[i]);
        }
    }
    if (typeof(obj) !== "object" || typeof(obj) === "string" || typeof(obj) === "number" || typeof(obj) === "boolean" || obj == null) {
        return obj;
    }
    var keys = Object.keys(obj);
    var n = keys.length;
    var lowKey;
    while (n--) {
        var key = keys[n];
        if (key === (lowKey = key.toLowerCase()))
            continue;
        obj[lowKey] = this.keysToLowerCase(obj[key]);
        delete obj[key];
    }
    return (obj);
  }

  async onSubmit(){
    try {  
      this.submitted = true;
      if (this.dadosGeraisForm.invalid ) {
          this.erro = 'Informe os dados.'
          return;
      } else {

        if(!this.dataSourceModulos){
          this.erro = 'Seleciona ao menos um Modulo pra continuar'
          return 
        }

        if(!this.dataSourceAcessos){ 
          this.erro = 'Defina um acesso'
          return 
        }
         
        let wait = 5000;
        this.isLoading = false;

        //MONTAR JSON CLIENTE 
        var dados = {};

        if(this.dadosGeraisForm){
          dados = {
            CODIGO: this.dadosGeraisForm.get('codigo')?.value,
            NOME: this.dadosGeraisForm.get('nome')?.value,
            //CPFCGC: (this.dadosGeraisForm.get('cpfcgc')?.value) ? this.dadosGeraisForm.get('cpfcgc')?.value : '',
            ENDRES: (this.dadosGeraisForm.get('endres')?.value) ? this.dadosGeraisForm.get('endres')?.value : '',
            BAIRRES: (this.dadosGeraisForm.get('bairres')?.value) ? this.dadosGeraisForm.get('bairres')?.value : '',
            CIDRES: (this.dadosGeraisForm.get('cidres')?.value) ? this.dadosGeraisForm.get('cidres')?.value : '',
            UFRES: (this.dadosGeraisForm.get('ufres')?.value) ? this.dadosGeraisForm.get('ufres')?.value : '',
            CEPRES: (this.dadosGeraisForm.get('cepres')?.value) ? this.dadosGeraisForm.get('cepres')?.value : '',
            FONE: (this.dadosGeraisForm.get('fone')?.value) ? this.dadosGeraisForm.get('fone')?.value : '',
            EMAIL: (this.dadosGeraisForm.get('email')?.value) ? this.dadosGeraisForm.get('email')?.value : '',
          }
        }

         //MONTAR JSON ACESSO 
         var acessos: any[] = [];
         if(this.dataSourceAcessos){ 
          this.dataSourceAcessos.data.forEach((acesso: any) =>{
             acessos.push(acesso)
          })
         }  
         

         //MONTAR JSON MODULOS
         var modulos: any[] = [];  
         if(this.dataSourceModulos){   
          this.dataSourceModulos.data.forEach((modulo: any) =>{ 
            modulos.push(modulo); 
          })
        }

        var jsonEnv = {
           dados: dados,
           modulos: modulos,
           acessos: acessos
        }
 

        /*console.log('DADOS');
        console.log(dados);
        console.log('MODULOS');
        console.log(modulos);
        console.log('ACESSOS');
        console.log(acessos);*/

        if(this.datas){
          await this.clientesService.atualizarCliente(jsonEnv).subscribe(retorno =>{
            console.log(retorno)
        }) 
        } else {
          await this.clientesService.incluirCliente(jsonEnv).subscribe(retorno =>{
              console.log(retorno)
          }) 
        }

       
    
        setTimeout(() => { 
          this.isLoading = true;
          this.close();
        }, wait);
      }
      
    } catch (error) {
      console.log(error);
      this.erro = 'ERRO'; 
      //this.alertErro(error);
    }
  } 

  saveSelect(ev: any, row: any){ 
     var modulos: any [] = [];
     var aux = {} 
     
     this.dataSourceModulos.data.forEach((item: any) => { 
      if(ev.checked){ 
        aux = { nome: item['nome'], enabled: 1 }
       } else {
        aux = { nome: item['nome'], enabled: 0 }
       } 
       modulos.push(aux);  
     })
   
     this.dataSourceMAux = new MatTableDataSource(modulos)
     this.dataSourceModulos = this.dataSourceMAux;

  }

  saveSelectAcessos(ev: any, row: any){
      
    var acessos: any [] = [];
    var aux = {} 
    
    this.dataSourceAcessos.data.forEach((item: any) => { 

      if(row['username'] == item['username']){
        if(ev.checked){ 
          aux = { username: item['username'], 
                  password: item['password'],
                  updated: item['updated'],
                  created: item['created'],
                  type: item['type'], 
                  enabled: 1 }
         } else {
          aux = { username: item['username'], 
                  password: item['password'], 
                  updated: item['updated'],
                  created: item['created'],
                  type: item['type'],  
                  enabled: 0 }
         } 
 
      } else {
        aux = { username: item['username'], 
                password: item['password'],
                updated: item['updated'],
                created: item['created'], 
                type: item['type'], 
                enabled: item['enabled'] }
      }
     
      acessos.push(aux); 
      
    }) 
    this.dataSourceMAux = new MatTableDataSource(acessos)
    this.dataSourceAcessos = this.dataSourceMAux;

    

 }
 
  isAllSelected() {
    if(this.dataSourceModulos){
      const numSelected = this.selection.selected.length;
      const numRows = this.dataSourceModulos.data.length;
      return numSelected === numRows;
    } else {
      return false
    }
    
  }
 
  masterToggle() {
    if(this.dataSourceModulos)
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSourceModulos.data.forEach((row: Usuario) => this.selection.select(row));
  }

  isAllSelectedAcesso() {
    if(this.dataSourceAcessos){
      const numSelected = this.selectionAcesso.selected.length;
      const numRows = this.dataSourceAcessos.data.length;
      return numSelected === numRows;
    } else {
      return false
    }
    
  }
 
  masterToggleAcesso() {
    if(this.dataSourceAcessos)
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSourceAcessos.data.forEach((row: Usuario) => this.selection.select(row));
  }

  close(){
    this.ngAfterViewInit();
    this.dialogRef.close();
  } 
}
