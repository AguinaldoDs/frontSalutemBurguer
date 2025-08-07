import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators, FormArray } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { lancheInterface } from '../lanche/lanche';
import { FormsModule } from '@angular/forms';


// pipe 
import { FiltroBuscaPipeCodigo } from '../../filtroBuscaCodigo.pipe';
import { FiltroBuscaPipe } from '../../filtroBuscaDescricao.pipe'; 

//model
import { BebidaInterface,PedidoItemBebidasInterface } from '../../model/bebidasModel';
import { PedidoItemLancheInterface } from '../../model/lacheModel';
import { InformacaoClientePedidoInterface } from '../../model/pedidoModel';


// interface
interface PedidoInterface {
  id?: number;
  dataRegistro?: string;
  informacoesCliente: InformacaoClientePedidoInterface; 
  itemLancheModel: PedidoItemLancheInterface[];
  itemBebidaModel: PedidoItemBebidasInterface[];
}



@Component({
  selector: 'app-pedido',
  templateUrl: './pedido.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,FormsModule,   FiltroBuscaPipe, FiltroBuscaPipeCodigo]
})


export class Pedido implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  termoBusca: string = '';
  termoBuscaCodigo: string = '';

  public pedidosFeitos: PedidoInterface[] = [];
  public pedidos: PedidoInterface[] = [];
  public lanchesAtivos: lancheInterface[] = [];
  public bebidasAtivas: BebidaInterface[] = [];

  // FormGroup para o formulário de pedido, com validações
  pedidoForm: FormGroup = this.fb.group({
    informacoesCliente: this.fb.group({
      nome: ['', Validators.required],
      endereco: ['', Validators.required],
      telefone: ['', [Validators.required, Validators.minLength(8)]],
      observacao: ['', ]
    }),
    // FormArray para a lista dinâmica de lanches
    itemLancheModel: this.fb.array([]),
    // FormArray para a lista dinâmica de bebidas
    itemBebidaModel: this.fb.array([])
  });

  // Getter para fácil acesso ao FormArray de lanches
  get lanchesFormArray(): FormArray {
    return this.pedidoForm.get('itemLancheModel') as FormArray;
  }

  // Getter para fácil acesso ao FormArray de bebidas
  get bebidasFormArray(): FormArray {
    return this.pedidoForm.get('itemBebidaModel') as FormArray;
  }

  ngOnInit(): void {
    this.findAllLanches();
    this.findAllBebidas();
    this.findAllPedidos();
  }

  // Busca e armazena a lista de todos os pedidos
  findAllPedidos(): void {
    this.http.get<PedidoInterface[]>('http://localhost:8080/api/pedidos/findAllPedidos')
    .subscribe({
      next: (data) =>{
        this.pedidosFeitos = data;
        console.log('esse são os pedidos já feitos ', data)
      }
    })
  }
  // Busca e armazena a lista de lanches disponíveis
  findAllLanches(): void {
    this.http.get<lancheInterface[]>('http://localhost:8080/api/lanche/findAllLanche')
      .subscribe({
        next: (data) => {
          this.lanchesAtivos = data;
        }
      });
  }
  // Busca e armazena a lista de bebidas disponíveis
  findAllBebidas(): void {
    this.http.get<BebidaInterface[]>('http://localhost:8080/api/bebidas/findAllBebidas')
      .subscribe({
        next: (data) => {
          this.bebidasAtivas = data;
        }
      });
      
  }
  // Obtém o nome do lanche pelo ID para exibição
  getNomeLanche(idLanche: number | null | undefined): string {
    if (!idLanche) return 'Lanche não especificado';
    const lanche = this.lanchesAtivos.find(l => l.id === idLanche);
    return lanche ? lanche.descricao : 'Lanche não encontrado';
  }
  // Obtém o nome da bebida pelo ID para exibição
  getNomeBebida(idBebida: number | null | undefined): string {
    if (!idBebida) return 'Bebida não especificada';
    const bebida = this.bebidasAtivas.find(b => b.id === idBebida);
    return bebida ? bebida.descricao : 'Bebida não encontrada';
  }
  // Reseta o formulário e os FormArrays de itens
  resetarFormulario(): void {
    this.pedidoForm.reset();
    this.lanchesFormArray.clear();
    this.bebidasFormArray.clear();
  }

  verPedidoEmEdicao = false;
  handlePedidoEmEdicao():void{
      this.verPedidoEmEdicao = !this.verPedidoEmEdicao
  }

  // Adiciona um novo FormGroup para um lanche no FormArray
  adicionaDivsLanches(): void {
    const lancheGroup = this.fb.group({
      id_lanche: [null, Validators.required],
      quantidade_pedido: [1, [Validators.required, Validators.min(1)]]
    });
    this.lanchesFormArray.push(lancheGroup);
  }
  // Remove um lanche do FormArray
  removeDivsLanches(index: number): void {
    this.lanchesFormArray.removeAt(index);
  }
  // Adiciona um novo FormGroup para uma bebida no FormArray
  adicionaDivsBebidas(): void {
    const bebidaGroup = this.fb.group({
      id_bebida: [null, Validators.required],
      quantidade_pedido: [1, [Validators.required, Validators.min(1)]]
    });
    this.bebidasFormArray.push(bebidaGroup);
  }
  // Remove uma bebida do FormArray
  removeDivsBebidas(index: number): void {
    this.bebidasFormArray.removeAt(index);
  }

  // Salva o pedido no backend
  savePedido(): void {
    // VERIFICA se o formulário é válido antes de enviar
    if (this.pedidoForm.invalid) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const novoPedido: PedidoInterface = {
      dataRegistro: new Date().toISOString(),
      informacoesCliente: this.pedidoForm.value.informacoesCliente,
      itemLancheModel: this.pedidoForm.value.itemLancheModel,
      itemBebidaModel: this.pedidoForm.value.itemBebidaModel
    };

    this.http.post<PedidoInterface>('http://localhost:8080/api/pedidos/savePedido', novoPedido)
      .subscribe({
        next: () => {
          this.resetarFormulario();
          this.findAllPedidos();
        },
        error: (err) => {
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