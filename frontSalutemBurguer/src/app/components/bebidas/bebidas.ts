import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// pipe
import { FiltroBuscaPipe } from '../../filtroBuscaDescricao.pipe';
import { FiltroBuscaPipeCodigo } from '../../filtroBuscaCodigo.pipe';

//model
import { BebidaInterface } from '../../model/bebidasModel';


// Imports...

/**
 * Componente responsável por gerenciar as operações CRUD (Create, Read, Update, Delete) de bebidas.
 * Permite listar, cadastrar, editar e excluir bebidas.
 */
@Component({
  selector: 'app-bebidas',
  standalone: true,
  imports: [CommonModule, FormsModule,FiltroBuscaPipe,FiltroBuscaPipeCodigo],
  templateUrl: './bebidas.html',
  styleUrl: './bebidas.css'
})

export class Bebidas implements OnInit {

  // Propriedades do componente
  bebidas: BebidaInterface[] = [];

  // Dados do formulário de cadastro
  novaDescricao: string = '';
  novoPreco: number = 0;
  novoZeroAcucar: boolean = false;
  novoStatus: boolean = true;

  // Propriedades de controle de UI
  mensagem: string | null = null;
  termoBusca: string = '';
  termoBuscaCodigo: string = '';
  showForm: boolean = false;

  // Objeto para edição
  editandoBebida: BebidaInterface | null = null;

  constructor(private http: HttpClient) {}

  /**
   * Hook de ciclo de vida do Angular. 
   * É chamado após a inicialização do componente.
   */
  ngOnInit(): void {
    this.carregarBebidas();
  }

  /**
   * Busca a lista completa de bebidas no backend.
   */
  carregarBebidas(): void {
    this.http.get<BebidaInterface[]>('http://localhost:8080/api/bebidas/findAllBebidas')
      .subscribe({
        next: (data) => this.bebidas = data,
        error: (err) => {
          this.mensagem = 'Erro ao carregar bebidas.';
        }
      });
  }

  /**
   * Cadastra uma nova bebida enviando os dados para o backend via POST.
   * @param event O evento do formulário para evitar o recarregamento da página.
   */
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
          this.mensagem = 'Erro ao cadastrar bebida.';
        }
      });
  }

  /**
   * Prepara o formulário para edição com os dados da bebida selecionada.
   * Cria uma cópia do objeto para evitar modificações diretas na lista.
   * @param bebida A bebida a ser editada.
   */
  iniciarEdicao(bebida: BebidaInterface): void {
    this.editandoBebida = { ...bebida };
    this.showForm = false;
  }

  /**
   * Salva as alterações de uma bebida existente no backend via PUT.
   */
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
          this.mensagem = 'Erro ao atualizar bebida.';
        }
      });
  }

  /**
   * Exclui uma bebida do backend com base no ID.
   * @param id O ID da bebida a ser excluída.
   */
  deletarBebida(id: number): void {
    if (!confirm('Deseja realmente excluir esta bebida?')) return;

    this.http.delete(`http://localhost:8080/api/bebidas/deleteBebidas/${id}`)
      .subscribe({
        next: () => this.carregarBebidas(),
        error: (err) => {
          this.mensagem = 'Erro ao excluir bebida.';
        }
      });
  }

  /**
   * Alterna a exibição do formulário de cadastro.
   */
  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) this.resetarFormulario();
  }

  /**
   * Reseta todas as propriedades do formulário de cadastro para seus valores iniciais.
   */
  private resetarFormulario(): void {
    this.novaDescricao = '';
    this.novoPreco = 0;
    this.novoZeroAcucar = false;
    this.novoStatus = true;
  }
}