export interface BebidaInterface {
  id: number;
  descricao: string;
  preco_uni: number;
  zero_acucar: boolean;
  ativo: boolean;
}

export interface PedidoItemBebidasInterface {
  id_bebida: number;
  quantidade_pedido: number;
}