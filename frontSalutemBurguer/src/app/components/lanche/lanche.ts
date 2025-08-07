import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

// pipe
import { FiltroBuscaPipeCodigo } from '../../filtroBuscaCodigo.pipe';
import { FiltroBuscaPipe } from '../../filtroBuscaDescricao.pipe';

// model
import { IngredienteInterface } from '../../model/ingredientesModel';

/**
 * Interface que representa um ingrediente dentro do contexto de um lanche.
 */
interface IngredienteLanche {
  id: number;
  id_ingrediente: number;
  descricao_ingrediente: string;
  preco_ingrediente: number;
  quantidade_padrao: number;
  ativo: boolean;
}

/**
 * Interface que representa a estrutura de um lanche.
 */
export interface lancheInterface {
  id: number;
  descricao: string;
  ativo: boolean;
  ingredientes: IngredienteLanche[];
}

/**
 * Componente responsável por gerenciar a lista e o cadastro/edição de lanches.
 * Utiliza o ReactiveFormsModule para um controle de formulário robusto e dinâmico.
 */
@Component({
  selector: 'app-lanche',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, FiltroBuscaPipe, FiltroBuscaPipeCodigo],
  templateUrl: './lanche.html',
})

export class Lanche implements OnInit {

  // Injeção de dependências
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  // Propriedades para controle de estado da UI e dados
  cadastrandoNovoLanche = false; // Controla a exibição do formulário
  ingredientesOpcoes: IngredienteInterface[] = []; // Lista de ingredientes disponíveis para seleção
  lanche: lancheInterface[] = []; // Lista de todos os lanches
  formCadastrar!: FormGroup; // O formulário reativo principal
  lancheEmEdicaoId: number | null = null; // ID do lanche que está sendo editado (null se for um novo)


  // Propriedades para filtro de busca
  termoBusca: string = '';
  termoBuscaCodigo: string = '';



  /**
   * Hook de ciclo de vida do Angular.
   * É executado na inicialização do componente para configurar o formulário e carregar dados.
   */
  ngOnInit(): void {
    // Inicialização do formulário reativo com FormArray para gerenciar os ingredientes
    this.formCadastrar = this.fb.group({
      descricao: ['', Validators.required],
      ativo: [true],
      ingredientes: this.fb.array([]), // FormArray para a lista dinâmica de ingredientes
    });

    // Busca todos os ingredientes ativos do backend para o dropdown do formulário
    this.http
      .get<IngredienteInterface[]>('http://localhost:8080/api/findAllIngredientesAtivos')
      .subscribe({
        next: (data) => {
          this.ingredientesOpcoes = data || [];
        },
        error: (err) => {
          console.error('Erro ao carregar ingredientes', err);
        },
      });
    
    // Busca a lista de lanches existentes para exibição
    this.findAllLanches();
  }

  /**
   * Busca todos os lanches do backend e armazena na propriedade 'lanche'.
   */
  findAllLanches(): void {
    this.http.get<lancheInterface[]>('http://localhost:8080/api/lanche/findAllLanche')
      .subscribe({
        next: (data) => {
          this.lanche = data;
          console.log(this.lanche)
        }
      });
  }


  /**
   * Getter para facilitar o acesso ao FormArray de ingredientes.
   * @returns O FormArray de ingredientes.
   */
  get ingredientesForm(): FormArray {
    return this.formCadastrar.get('ingredientes') as FormArray;
  }

  /**
   * Alterna a exibição do formulário de cadastro/edição.
   */
  handleCadastrandoNovoLanche() {
    this.cadastrandoNovoLanche = !this.cadastrandoNovoLanche;
  }

  /**
   * Adiciona um novo FormGroup de ingrediente ao FormArray de ingredientes.
   * Adiciona um listener para atualizar o valor do ingrediente com base na seleção.
   */
  adicionaIngrediente(): void {
    const ingredienteForm = this.fb.group({
      id_ingrediente: [null, Validators.required],
      quantidade: [1, [Validators.required, Validators.min(1)]],
      valor: [0],
    });

    // Assina as mudanças no campo 'id_ingrediente' para atualizar o preço unitário
    ingredienteForm.get('id_ingrediente')?.valueChanges.subscribe((id) => {
      const selecionado = this.ingredientesOpcoes.find(i => i.id === id);
      // Atualiza o campo 'valor' sem disparar um novo evento, evitando loops
      ingredienteForm.patchValue({
        valor: selecionado ? selecionado.preco_uni : 0
      }, { emitEvent: false });
    });

    this.ingredientesForm.push(ingredienteForm);
  }

  /**
   * Remove um FormGroup de ingrediente do FormArray.
   * @param index O índice do ingrediente a ser removido.
   */
  removerIngrediente(index: number): void {
    this.ingredientesForm.removeAt(index);
  }

  /**
   * Busca a descrição de um ingrediente com base em seu ID.
   * @param id O ID do ingrediente.
   * @returns A descrição do ingrediente ou uma string vazia se não for encontrado.
   */
  getDescricaoById(id: number): string {
    return this.ingredientesOpcoes.find(i => i.id === id)?.descricao || '';
  }


  /**
   * Método auxiliar para criar um FormGroup para um ingrediente.
   * Usado para adicionar novos ingredientes e popular o formulário de edição.
   * @param ingrediente Dados parciais do ingrediente para inicializar o formulário.
   * @returns Um FormGroup configurado para um ingrediente.
   */
  private criarIngredienteForm(ingrediente?: Partial<IngredienteLanche>) {
    const group = this.fb.group({
      id_ingrediente: [ingrediente?.id_ingrediente || null, Validators.required],
      quantidade: [ingrediente?.quantidade_padrao || 1, [Validators.required, Validators.min(1)]],
      valor: [ingrediente?.preco_ingrediente || 0],
    });

    // Assina as mudanças para atualizar o valor do ingrediente.
    group.get('id_ingrediente')?.valueChanges.subscribe((id) => {
      const selecionado = this.ingredientesOpcoes.find(i => i.id === id);
      group.patchValue({ valor: selecionado?.preco_uni || 0 }, { emitEvent: false });
    });

    return group;
  }


  /**
   * Salva um novo lanche ou atualiza um lanche existente no backend.
   * A lógica de criação/edição é determinada pela propriedade 'lancheEmEdicaoId'.
   */
  salvaLanche(): void {
    const formValue = this.formCadastrar.value;

    // Monta o payload com os dados do formulário e os ingredientes
    const payload: any = {
      descricao: formValue.descricao,
      ativo: formValue.ativo,
      ingredientes: this.ingredientesForm.controls.map(control => {
        const id = control.get('id_ingrediente')?.value;
        const qtd = control.get('quantidade')?.value || 0;
        const valor = control.get('valor')?.value || 0;
        const precoTotal = qtd * valor;

        return {
          id_ingrediente: id,
          descricao_ingrediente: this.getDescricaoById(id),
          preco_ingrediente: precoTotal,
          quantidade_padrao: qtd,
          ativo: true,
        };
      }),
    };

    // Lógica para ATUALIZAR um lanche existente
    if (this.lancheEmEdicaoId !== null) {
      payload.id = this.lancheEmEdicaoId;

      this.http.put('http://localhost:8080/api/lanche/updateLanche', payload).subscribe({
        next: (res) => {
          alert('Lanche atualizado com sucesso!');
          this.resetarFormulario();
        },
        error: (err) => {
          alert('Erro ao atualizar lanche');
        }
      });
    } else {
      // Lógica para CRIAR um novo lanche
      this.http.post('http://localhost:8080/api/lanche/saveLanche', payload).subscribe({
        next: (res) => {
          console.log('Lanche criado com sucesso!', res);
          alert('Lanche criado com sucesso!');
          this.resetarFormulario();
        },
        error: (err) => {
          console.error('Erro ao criar lanche', err);
          alert('Erro ao criar lanche');
        }
      });
    }
  }


  /**
   * Prepara o formulário para edição com os dados do lanche selecionado.
   * @param item O objeto lanche a ser editado.
   */
  editarLanche(item: lancheInterface): void {
    this.cadastrandoNovoLanche = true;
    this.lancheEmEdicaoId = item.id;

    // Preenche os campos principais do formulário com os dados do lanche
    this.formCadastrar.patchValue({
      descricao: item.descricao,
      ativo: item.ativo
    });

    // Limpa o FormArray e o repopula com os ingredientes do lanche
    this.ingredientesForm.clear();
    item.ingredientes.forEach(ing => {
      this.ingredientesForm.push(this.criarIngredienteForm(ing));
    });

  }

  /**
   * Reseta o formulário para seu estado inicial.
   */
  resetarFormulario(): void {
    this.formCadastrar.reset({ ativo: true });
    this.ingredientesForm.clear();
    this.lancheEmEdicaoId = null;
    this.cadastrandoNovoLanche = false;
    this.findAllLanches();
  }

  /**
   * Alterna o estado de edição para falso.
   */
  editarLancheFalse(): void {
    this.cadastrandoNovoLanche = false;
  }

  /**
   * Exclui um lanche e remove o item do array localmente.
   * @param id O ID do lanche a ser excluído.
   */
  deletarLanche(id: number): void {
    if (!confirm('Tem certeza que deseja excluir este lanche?')) return;

    this.http.delete(`http://localhost:8080/api/lanche/deleteLanche/${id}`).subscribe({
      next: () => {
        // Remove o lanche da lista localmente para uma atualização mais rápida da UI
        this.lanche = this.lanche.filter(l => l.id !== id);
      },
    });
  }

  /**
   * Calcula o preço total de todos os ingredientes no formulário de lanche.
   * @returns O preço total.
   */
  getTotal(): number {
    return this.ingredientesForm.controls.reduce((total, control) => {
      const qtd = control.get('quantidade')?.value || 0;
      const valor = control.get('valor')?.value || 0;
      return total + (qtd * valor);
    }, 0);
  }
}