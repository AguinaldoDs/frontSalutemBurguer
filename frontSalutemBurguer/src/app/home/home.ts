import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { bootstrapCupStraw } from '@ng-icons/bootstrap-icons';
import { lucideHam,lucideHamburger,lucideSend } from '@ng-icons/lucide'


//componentes
import { Bebidas } from '../components/bebidas/bebidas';
import { Ingredientes } from '../components/ingredientes/ingredientes';
import { Lanche } from '../components/lanche/lanche';
import { Pedido } from '../components/pedido/pedido';

@Component({
  selector: 'app-home',
  imports: [CommonModule,
            NgIcon,
            Bebidas,
            Ingredientes,
            Lanche,
            Pedido],

  templateUrl: './home.html',
  viewProviders: [provideIcons({ bootstrapCupStraw,
                                 lucideHam,
                                 lucideHamburger,
                                 lucideSend })]
})
export class Home {

  componenteVisualizado = ''
  hadleComponenteVisualizado(nomeComponente: string): void {
    if(this.componenteVisualizado == nomeComponente){
      this.componenteVisualizado = ''
    }else{
      this.componenteVisualizado = nomeComponente
    }
  }

}
