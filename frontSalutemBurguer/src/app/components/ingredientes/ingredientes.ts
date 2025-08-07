import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// pipe
import { FiltroBuscaPipe } from '../../filtroBuscaDescricao.pipe';
import { FiltroBuscaPipeCodigo } from '../../filtroBuscaCodigo.pipe';

//model
import { IngredienteInterface } from '../../model/ingredientesModel';


/**
 * Componente responsável por gerenciar as operações CRUD (Create, Read, Update, Delete) de ingredientes.
 * Permite listar, cadastrar, editar e excluir ingredientes.
 */
@Component({
  selector: 'app-ingredientes',
  standalone: true,
  imports: [CommonModule, FormsModule, FiltroBuscaPipe, FiltroBuscaPipeCodigo],
  templateUrl: './ingredientes.html',
  styleUrls: ['./ingredientes.css'],
})
export class Ingredientes implements OnInit {

  // Armazena a lista de ingredientes carregada do backend
  ingredientes: IngredienteInterface[] = [];

  // Propriedades para o formulário de cadastro
  novaDescricao: string = '';
  novoPreco: number = 0;
  novoAdicional: boolean = false;
  novoStatus: boolean = true;

  // Propriedades para filtros e feedback da interface
  termoBusca: string = '';
  termoBuscaCodigo: string  ='';
  mensagem: string | null = null;
  carregando: boolean = false;
  showForm: boolean = false;

  // Propriedades para o formulário de edição
  editandoId: number | null = null;
  editandoIngrediente: IngredienteInterface | null = null;

  constructor(private http: HttpClient) {}

  /**
   * Hook de ciclo de vida do Angular, chamado após a inicialização do componente.
   * Inicia o carregamento dos ingredientes.
   */
  ngOnInit(): void {
    this.carregarIngredientes();
  }

  /**
   * Realiza a requisição para buscar todos os ingredientes no backend.
   * Gerencia o estado de carregamento e exibe mensagens de erro, se houver.
   */
  carregarIngredientes(): void {
    this.carregando = true;
    this.http.get<IngredienteInterface[]>('http://localhost:8080/api/findAllIngredientes')
      .subscribe({
        next: (data) => {
          this.ingredientes = data;
          this.carregando = false;
        },
        error: (err) => {
          this.mensagem = 'Não foi possível carregar os ingredientes';
          this.carregando = false;
        }
      });
  }

  /**
   * Envia os dados de um novo ingrediente para o backend via POST.
   * @param event O evento do formulário, usado para prevenir o recarregamento da página.
   */
  cadastrarIngrediente(event: Event): void {
    event.preventDefault();
    this.mensagem = null;

    const descricaoLimpa = this.novaDescricao.trim();

    if (!descricaoLimpa) {
      this.mensagem = 'A descrição não pode estar vazia!';
      return;
    }

    const ingredienteData = {
      descricao: descricaoLimpa,
      preco_uni: this.novoPreco,
      adicional: this.novoAdicional,
      ativo: this.novoStatus
    };

    this.http.post('http://localhost:8080/api/createIngredientes', ingredienteData)
      .subscribe({
        next: () => {
          this.resetarFormulario();
          this.carregarIngredientes();
          this.mensagem = 'Ingrediente salvo com sucesso!';
        },
        error: (err) => {
          this.mensagem = 'Ocorreu um erro ao salvar o ingrediente';
        }
      });
  }

  /**
   * Ativa o modo de edição, copiando os dados do item selecionado para o formulário.
   * @param item O ingrediente a ser editado.
   */
  iniciarEdicao(item: IngredienteInterface): void {
    this.editandoIngrediente = { ...item };
    this.showForm = false;
  }

  /**
   * Envia os dados atualizados do ingrediente para o backend via PUT.
   */
  salvarEdicao(): void {
    if (!this.editandoIngrediente) return;

    // Constrói o objeto com os dados necessários para a atualização
    const dadosAtualizados = {
      id: this.editandoIngrediente.id,
      descricao: this.editandoIngrediente.descricao,
      preco_uni: this.editandoIngrediente.preco_uni,
      adicional: this.editandoIngrediente.adicional,
      ativo: this.editandoIngrediente.ativo
    };

    this.http.put('http://localhost:8080/api/updateIngrediente', dadosAtualizados)
      .subscribe({
        next: () => {
          this.mensagem = 'Ingrediente atualizado com sucesso!';
          this.editandoIngrediente = null;
          this.carregarIngredientes();
        },
        error: (err) => {
          this.mensagem = 'Erro ao atualizar o ingrediente';
        }
      });
  }

  /**
   * Exclui um ingrediente do backend com base no seu ID.
   * Requer confirmação do usuário.
   * @param id O ID do ingrediente a ser excluído.
   */
  deletarIngrediente(id: number): void {
    if (!confirm('Tem certeza que deseja excluir este ingrediente?')) return;

    this.http.delete(`http://localhost:8080/api/deleteIngredientes/${id}`)
      .subscribe({
        next: () => {
          this.carregarIngredientes();
        },
        error: (err) => {
          this.mensagem = 'Não foi possível excluir o ingrediente';
        }
      });
  }

  /**
   * Alterna a visibilidade do formulário de cadastro.
   */
  toggleForm(): void {
    this.showForm = !this.showForm;
    this.editandoId = null;
    if (!this.showForm) this.resetarFormulario();
  }

  /**
   * Limpa os campos do formulário de cadastro.
   */
  private resetarFormulario(): void {
    this.novaDescricao = '';
    this.novoPreco = 0;
    this.novoAdicional = false;
    this.novoStatus = true;
    this.editandoId = null;
  }
}