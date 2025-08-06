import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroLancheCodigo',
  standalone: true,
})

export class FiltroLanchePipeCodigo implements PipeTransform {
  transform(lanches: any[], termo: string): any[] {
    if (!termo) return lanches;

    return lanches.filter(lanches =>
      lanches.id.toString().includes(termo.toString())
    );

    
  }
}
