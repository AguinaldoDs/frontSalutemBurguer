import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroBebidas',
  standalone: true,
})

export class FiltroBebidasPipe implements PipeTransform {
  transform(bebidas: any[], termo: string): any[] {
    if (!bebidas || !termo) return bebidas;

    termo = termo.toLowerCase();

    return bebidas.filter(ing =>
      ing.descricao?.toLowerCase().includes(termo)
    );
  }
}
