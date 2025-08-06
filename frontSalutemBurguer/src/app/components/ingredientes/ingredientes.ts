import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { bootstrapTrash, bootstrapPencil, bootstrapCheckLg } from '@ng-icons/bootstrap-icons';

// pipe
import { FiltroIngredientePipe } from '../../filtroIngrediente.pipe';
import { FiltroIngredientePipeCodigo } from '../../filtroIngredienteCodigo.pipe';

//model
import { IngredienteInterface } from '../../model/ingredientesModel';


@Component({
  selector: 'app-ingredientes',
  standalone: true,
  imports: [CommonModule, FormsModule, FiltroIngredientePipe, FiltroIngredientePipeCodigo],
  templateUrl: './ingredientes.html',
  styleUrls: ['./ingredientes.css'],
  // viewProviders: [provideIcons({ bootstrapTrash, bootstrapPencil, bootstrapCheckLg })]
})
export class Ingredientes implements OnInit {

  // ================== PROPRIEDADES ==================

  ingredientes: IngredienteInterface[] = [];

  // Campos para novo ingrediente
  novaDescricao: string = '';
  novoPreco: number = 0;
  novoAdicional: boolean = false;
  novoStatus: boolean = true;

  // Estados da UI
  termoBusca: string = '';
  termoBuscaCodigo: string  ='';
  mensagem: string | null = null;
  carregando: boolean = false;
  showForm: boolean = false;

  // Controle de edição
  editandoId: number | null = null;
  editandoIngrediente: IngredienteInterface | null = null;

  constructor(private http: HttpClient) {}

  // ================== CICLO DE VIDA ==================
  ngOnInit(): void {
    this.carregarIngredientes();
  }

  // ================== MÉTODOS ==================

  // Carrega todos os ingredientes da API
  carregarIngredientes(): void {
    this.carregando = true;

    this.http.get<IngredienteInterface[]>('http://localhost:8080/api/findAllIngredientes')
      .subscribe({
        next: (data) => {
          this.ingredientes = data;
          this.carregando = false;
        },
        error: (err) => {
          console.error('Erro ao carregar ingredientes', err);
          this.mensagem = 'Não foi possível carregar os ingredientes';
          this.carregando = false;
        }
      });
  }

  // Cadastra um novo ingrediente
  cadastrarIngrediente(event: Event): void {
    event.preventDefault();
    this.mensagem = null;

    const descricaoLimpa = this.novaDescricao.trim();

    if (!descricaoLimpa) {
      this.mensagem = '<div class="text-red-600">A descrição não pode estar vazia!</div>';
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
          this.mensagem = '<div class="text-green-600">Ingrediente salvo com sucesso!</div>';
        },
        error: (err) => {
          console.error('Erro ao salvar ingrediente', err);
          this.mensagem = '<div class="text-red-600">Ocorreu um erro ao salvar o ingrediente</div>';
        }
      });
  }

  // Inicia a edição de um ingrediente
  iniciarEdicao(item: IngredienteInterface): void {
    this.editandoIngrediente = { ...item }; // Cópia para edição isolada
    this.showForm = false;
  }

  // Salva as alterações do ingrediente em edição
  salvarEdicao(): void {
    if (!this.editandoIngrediente) return;

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
          console.error('Erro ao atualizar ingrediente', err);
          this.mensagem = 'Erro ao atualizar o ingrediente';
        }
      });
  }

  // Deleta um ingrediente
  deletarIngrediente(id: number): void {
    if (!confirm('Tem certeza que deseja excluir este ingrediente?')) return;

    this.http.delete(`http://localhost:8080/api/deleteIngredientes/${id}`)
      .subscribe({
        next: () => {
          this.carregarIngredientes();
        },
        error: (err) => {
          console.error('Erro ao deletar ingrediente', err);
          this.mensagem = 'Não foi possível excluir o ingrediente';
        }
      });
  }

  // Alterna exibição do formulário de criação
  toggleForm(): void {
    this.showForm = !this.showForm;
    this.editandoId = null;
    if (!this.showForm) this.resetarFormulario();
  }

  // Limpa campos do formulário
  private resetarFormulario(): void {
    this.novaDescricao = '';
    this.novoPreco = 0;
    this.novoAdicional = false;
    this.novoStatus = true;
    this.editandoId = null;
  }
}
