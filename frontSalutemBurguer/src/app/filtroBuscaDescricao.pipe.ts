import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroPipe',
  standalone: true,
})

export class FiltroBuscaPipe implements PipeTransform {
  transform(itemDescricao: any[], termo: string): any[] {
    if (!itemDescricao || !termo) return itemDescricao;

    termo = termo.toLowerCase();

    return itemDescricao.filter(ing =>
      ing.descricao?.toLowerCase().includes(termo)
    );
  }
}
