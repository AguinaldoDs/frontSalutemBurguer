import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroLanche',
  standalone: true,
})

export class FiltroLanchePipe implements PipeTransform {
  transform(lanche: any[], termo: string): any[] {
    if (!lanche || !termo) return lanche;

    termo = termo.toLowerCase();

    return lanche.filter(ing =>
      ing.descricao?.toLowerCase().includes(termo)
    );
  }
}
