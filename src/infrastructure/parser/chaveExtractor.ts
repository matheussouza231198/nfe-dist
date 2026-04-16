export function extrairChaveNfe(xml: string): string | null {
  const byTag = xml.match(/<chNFe>(\d{44})<\/chNFe>/);
  if (byTag) return byTag[1];

  const byAttr = xml.match(/Id="NFe(\d{44})"/);
  if (byAttr) return byAttr[1];

  return null;
}
