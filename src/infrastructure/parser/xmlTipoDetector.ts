export type TipoDocumento = 'procNFe' | 'resNFe' | 'procEventoNFe' | 'desconhecido';

export function detectarTipoDocumento(xml: string): TipoDocumento {
  if (xml.includes('<procNFe')) return 'procNFe';
  if (xml.includes('<resNFe')) return 'resNFe';
  if (xml.includes('<procEventoNFe')) return 'procEventoNFe';
  return 'desconhecido';
}
