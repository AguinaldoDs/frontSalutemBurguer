import { Routes } from '@angular/router';
import { Ingredientes } from './components/ingredientes/ingredientes';
import { Bebidas } from './components/bebidas/bebidas';
import { Home } from './home/home';
import { Lanche } from './components/lanche/lanche';
import { Pedido } from './components/pedido/pedido';

export const routes: Routes = [
  { path: 'ingredientes', component: Ingredientes },
  { path: 'bebidas', component: Bebidas },
  { path: 'lanche', component: Lanche },
  { path: 'home', component: Home },
  { path: 'pedido', component: Pedido}            
];
