import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// pipe
import { FiltroBebidasPipe } from '../../filtroBebidas.pipe';
import { FiltroBebidasPipeCodigo } from '../../filtroBebidasCodigo.pipe';

//model
import { BebidaInterface } from '../../model/bebidasModel';


@Component({
  selector: 'app-bebidas',
  standalone: true,
  imports: [CommonModule, FormsModule,FiltroBebidasPipe,FiltroBebidasPipeCodigo],
  templateUrl: './bebidas.html',
  styleUrl: './bebidas.css'
})
export class Bebidas implements OnInit {

  bebidas: BebidaInterface[] = [];

  // Formulário de criação
  novaDescricao: string = '';
  novoPreco: number = 0;
  novoZeroAcucar: boolean = false;
  novoStatus: boolean = true;

  mensagem: string | null = null;
  termoBusca: string = '';
  termoBuscaCodigo: string = '';
  showForm: boolean = false;

  // Edição
  editandoBebida: BebidaInterface | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.carregarBebidas();
  }

  carregarBebidas(): void {
    this.http.get<BebidaInterface[]>('http://localhost:8080/api/bebidas/findAllBebidas')
      .subscribe({
        next: (data) => this.bebidas = data,
        error: (err) => {
          console.error('Erro ao carregar bebidas', err);
          this.mensagem = 'Erro ao carregar bebidas.';
        }
      });
  }

  cadastrarBebida(event: Event): void {
    event.preventDefault();

    const nova = {
      descricao: this.novaDescricao.trim(),
      preco_uni: this.novoPreco,
      zero_acucar: this.novoZeroAcucar,
      ativo: this.novoStatus
    };

    this.http.post('http://localhost:8080/api/bebidas/createBebidas', nova)
      .subscribe({
        next: () => {
          this.mensagem = 'Bebida cadastrada com sucesso!';
          this.resetarFormulario();
          this.carregarBebidas();
        },
        error: (err) => {
          console.error('Erro ao salvar bebida', err);
          this.mensagem = 'Erro ao cadastrar bebida.';
        }
      });
  }

  iniciarEdicao(bebida: BebidaInterface): void {
    this.editandoBebida = { ...bebida };
    this.showForm = false;
  }

  salvarEdicao(): void {
    if (!this.editandoBebida) return;

    this.http.put('http://localhost:8080/api/bebidas/updateBebida', this.editandoBebida)
      .subscribe({
        next: () => {
          this.mensagem = 'Bebida atualizada com sucesso!';
          this.editandoBebida = null;
          this.carregarBebidas();
        },
        error: (err) => {
          console.error('Erro ao atualizar bebida', err);
          this.mensagem = 'Erro ao atualizar bebida.';
        }
      });
  }

  deletarBebida(id: number): void {
    if (!confirm('Deseja realmente excluir esta bebida?')) return;

    this.http.delete(`http://localhost:8080/api/bebidas/deleteBebidas/${id}`)
      .subscribe({
        next: () => this.carregarBebidas(),
        error: (err) => {
          console.error('Erro ao excluir bebida', err);
          this.mensagem = 'Erro ao excluir bebida.';
        }
      });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) this.resetarFormulario();
  }

  private resetarFormulario(): void {
    this.novaDescricao = '';
    this.novoPreco = 0;
    this.novoZeroAcucar = false;
    this.novoStatus = true;
  }
}
