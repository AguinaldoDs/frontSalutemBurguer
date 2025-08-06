import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators, FormArray } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { lancheInterface } from '../lanche/lanche';

//model
import { BebidaInterface,PedidoItemBebidasInterface } from '../../model/bebidasModel';
import { PedidoItemLancheInterface } from '../../model/lacheModel';
import { InformacaoClientePedidoInterface } from '../../model/pedidoModel';


// interface
interface PedidoInterface {
  id?: number;
  dataRegistro?: string;
  informacoesCliente: InformacaoClientePedidoInterface[];
  itemLancheModel: PedidoItemLancheInterface[];
  itemBebidaModel: PedidoItemBebidasInterface[];
}

@Component({
  selector: 'app-pedido',
  templateUrl: './pedido.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})


export class Pedido implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  public pedidosFeitos: PedidoInterface[] = [];
  public pedidos: PedidoInterface[] = [];
  public lanchesAtivos: lancheInterface[] = [];
  public bebidasAtivas: BebidaInterface[] = [];

  pedidoForm: FormGroup = this.fb.group({
    informacoesCliente: this.fb.group({
      nome: ['', Validators.required],
      endereco: ['', Validators.required],
      telefone: ['', [Validators.required, Validators.minLength(8)]]
    }),
    itemLancheModel: this.fb.array([]),
    itemBebidaModel: this.fb.array([])
  });

  get lanchesFormArray(): FormArray {
    return this.pedidoForm.get('itemLancheModel') as FormArray;
  }

  get bebidasFormArray(): FormArray {
    return this.pedidoForm.get('itemBebidaModel') as FormArray;
  }

  ngOnInit(): void {
    this.findAllLanches();
    this.findAllBebidas();
    this.findAllPedidos();
  }


  findAllPedidos(): void {
    this.http.get<PedidoInterface[]>('http://localhost:8080/api/pedidos/findAllPedidos')
    .subscribe({
      next: (data) =>{
        this.pedidosFeitos = data;
        console.log('esse são os pedidos já feitos ', data)
      }
    })
  }

  findAllLanches(): void {
    this.http.get<lancheInterface[]>('http://localhost:8080/api/lanche/findAllLanche')
      .subscribe({
        next: (data) => {
          this.lanchesAtivos = data;
        }
      });
  }

  findAllBebidas(): void {
    this.http.get<BebidaInterface[]>('http://localhost:8080/api/bebidas/findAllBebidas')
      .subscribe({
        next: (data) => {
          this.bebidasAtivas = data;
        }
      });
      
  }

  resetarFormulario(): void {
  this.pedidoForm.reset();
  this.lanchesFormArray.clear();
  this.bebidasFormArray.clear();
}

  verPedidoEmEdicao = false;
  handlePedidoEmEdicao():void{
      this.verPedidoEmEdicao = !this.verPedidoEmEdicao
  }


 
  adicionaDivsLanches(): void {
    const lancheGroup = this.fb.group({
      id_lanche: [null, Validators.required],
      quantidade_pedido: [1, [Validators.required, Validators.min(1)]]
    });
    this.lanchesFormArray.push(lancheGroup);
  }

  removeDivsLanches(index: number): void {
    this.lanchesFormArray.removeAt(index);
  }

  adicionaDivsBebidas(): void {
    const bebidaGroup = this.fb.group({
      id_bebida: [null, Validators.required],
      quantidade_pedido: [1, [Validators.required, Validators.min(1)]]
    });
    this.bebidasFormArray.push(bebidaGroup);
  }

  removeDivsBebidas(index: number): void {
    this.bebidasFormArray.removeAt(index);
  }

  savePedido(): void {
    if (this.pedidoForm.invalid) {
      alert('Preencha todos os campos corretamente!');
      return;
    }

    if(this.verPedidoEmEdicao){
      this.handlePedidoEmEdicao()
    }

    const novoPedido: PedidoInterface = {
      dataRegistro: new Date().toISOString(),
      informacoesCliente: [this.pedidoForm.value.informacoesCliente],
      itemLancheModel: this.pedidoForm.value.itemLancheModel,
      itemBebidaModel: this.pedidoForm.value.itemBebidaModel
    };

    this.http.post<PedidoInterface>('http://localhost:8080/api/pedidos/savePedido', novoPedido)
      .subscribe({
        next: () => {
          alert('Pedido salvo com sucesso!');
          this.pedidoForm.reset();
          this.lanchesFormArray.clear();
          this.bebidasFormArray.clear();
          this.findAllLanches();
          this.findAllBebidas();
        },
        error: (err) => {
          alert('Erro ao salvar pedido.');
          console.error(err);
        }
      });
  }

  verLista = false;
  handleVerLista(): void{
    this.verLista = !this.verLista
    console.log(this.verLista)
  }
}
