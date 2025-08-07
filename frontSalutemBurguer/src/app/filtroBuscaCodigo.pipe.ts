import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroPipeCodigo',
  standalone: true,
})

export class FiltroBuscaPipeCodigo implements PipeTransform {
    transform(codigo: any[], termo: string): any[] {
    if (!termo) return codigo;

    return codigo.filter(codigo =>
      codigo.id.toString().includes(termo.toString())
    ); 
  }
}
