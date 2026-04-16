export function detectarTipoDocumento(xml) {
  if (xml.includes('<procNFe')) return 'procNFe';
  if (xml.includes('<resNFe')) return 'resNFe';
  if (xml.includes('<procEventoNFe')) return 'procEventoNFe';
  return 'desconhecido';
}
