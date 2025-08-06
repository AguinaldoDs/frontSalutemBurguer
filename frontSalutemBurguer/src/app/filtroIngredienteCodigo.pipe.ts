import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroIngredienteCodigo',
  standalone: true,
})

export class FiltroIngredientePipeCodigo implements PipeTransform {
  transform(ingredientes: any[], termo: string): any[] {
    if (!termo) return ingredientes;

    return ingredientes.filter(ingrediente =>
      ingrediente.id.toString().includes(termo.toString())
    );

    
  }
}
