import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroIngrediente',
  standalone: true,
})
export class FiltroIngredientePipe implements PipeTransform {
  transform(ingredientes: any[], termo: string): any[] {
    if (!ingredientes || !termo) return ingredientes;

    termo = termo.toLowerCase();

    return ingredientes.filter(ing =>
      ing.descricao?.toLowerCase().includes(termo)
    );
  }
}
