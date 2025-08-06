import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroBebidasCodigo',
  standalone: true,
})


export class FiltroBebidasPipeCodigo implements PipeTransform {
 transform(bebidas: any[], termo: string): any[] {
    if (!termo) return bebidas;

    return bebidas.filter(bebida =>
      bebida.id.toString().includes(termo.toString())
    );
  }
}

