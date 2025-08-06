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
import { FiltroLanchePipeCodigo } from '../../filtroLanchesCodigo.pipe';
import { FiltroLanchePipe } from '../../filtroLanches.pipe';

// model
import { IngredienteInterface } from '../../model/ingredientesModel';

interface IngredienteLanche {
  id: number;
  id_ingrediente: number;
  descricao_ingrediente: string;
  preco_ingrediente: number;
  quantidade_padrao: number;
  ativo: boolean;
}

export interface lancheInterface {
  id: number;
  descricao: string;
  ativo: boolean;
  ingredientes: IngredienteLanche[];
}

@Component({
  selector: 'app-lanche',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, FiltroLanchePipe, FiltroLanchePipeCodigo],
  templateUrl: './lanche.html',
})

export class Lanche implements OnInit {

  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  cadastrandoNovoLanche = false;
  ingredientesOpcoes: IngredienteInterface[] = [];
  lanche: lancheInterface[] = [];
  formCadastrar!: FormGroup;

  termoBusca: string = '';
  termoBuscaCodigo: string = '';

  ngOnInit(): void {
    this.formCadastrar = this.fb.group({
      descricao: ['', Validators.required],
      ativo: [true],
      ingredientes: this.fb.array([]),
    });

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

    this.http.get<lancheInterface[]>('http://localhost:8080/api/lanche/findAllLanche')
      .subscribe({
        next: (data) => {
          this.lanche = data;
          console.log(this.lanche)
        }
      });
  }

  get ingredientesForm(): FormArray {
    return this.formCadastrar.get('ingredientes') as FormArray;
  }

  handleCadastrandoNovoLanche() {
    this.cadastrandoNovoLanche = !this.cadastrandoNovoLanche;
  }

  adicionaIngrediente(): void {
    const ingredienteForm = this.fb.group({
      id_ingrediente: [null, Validators.required],
      quantidade: [1, [Validators.required, Validators.min(1)]],
      valor: [0],
    });


    ingredienteForm.get('id_ingrediente')?.valueChanges.subscribe((id) => {
      const selecionado = this.ingredientesOpcoes.find(i => i.id === id);
      ingredienteForm.patchValue({
        valor: selecionado ? selecionado.preco_uni : 0
      }, { emitEvent: false });
    });

    this.ingredientesForm.push(ingredienteForm);
  }

  removerIngrediente(index: number): void {
    this.ingredientesForm.removeAt(index);
  }

  getDescricaoById(id: number): string {
    return this.ingredientesOpcoes.find(i => i.id === id)?.descricao || '';
  }

  salvaLanche(): void {
    const formValue = this.formCadastrar.value;

    const payload = {
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

    console.log('Payload:', payload);

    this.http.post('http://localhost:8080/api/lanche/saveLanche', payload).subscribe({
      next: (res) => console.log('Cadastrado com sucesso!', res),
      error: (err) => console.error('Erro ao cadastrar', err),
    });
  }

  editarLanche(item: lancheInterface): void {
    this.cadastrandoNovoLanche = true;
    this.ingredientesForm.clear();

    this.formCadastrar.patchValue({
      descricao: item.descricao,
      ativo: item.ativo
    });

    item.ingredientes.forEach(ing => {
      this.ingredientesForm.push(
        this.fb.group({
          id_ingrediente: [ing.id, Validators.required],
          quantidade: [1, [Validators.required, Validators.min(1)]],
          valor: [ing.preco_ingrediente || 0]
        })
      );
    });
  }

  editarLancheFalse(): void {
    this.cadastrandoNovoLanche = false;
  }

  deletarLanche(id: number): void {
    if (!confirm('Tem certeza que deseja excluir este lanche?')) return;

    this.http.delete(`http://localhost:8080/api/lanche/deleteLanche/${id}`).subscribe({
      next: () => {
        console.log(`Lanche ${id} excluído com sucesso.`);
        this.lanche = this.lanche.filter(l => l.id !== id);
      },
      error: (err) => {
        console.error(`Erro ao excluir o lanche ${id}:`, err);
      }
    });
  }

  getTotal(): number {
    return this.ingredientesForm.controls.reduce((total, control) => {
      const qtd = control.get('quantidade')?.value || 0;
      const valor = control.get('valor')?.value || 0;
      return total + (qtd * valor);
    }, 0);
  }
}
