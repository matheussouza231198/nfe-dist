# MVP - Serviço de distribuição de DF-e (NF-e)

Este projeto é um **MVP em Node.js** para consumir o webservice `NFeDistribuicaoDFe` da SEFAZ e baixar XMLs de NF-e por CNPJ, com controle incremental de NSU.

## Funcionalidades implementadas

- Consumo SOAP (`nfeDistDFeInteresse`) com certificado A1 (.pfx) em modo real.
- Modo mock para desenvolvimento local sem integração com SEFAZ.
- Processamento de `docZip` (base64 + gzip; fallback simples para payload sem gzip no mock).
- Identificação de tipo de documento (`resNFe`, `procNFe`, `procEventoNFe`).
- Persistência em disco por `CNPJ/AAAA/MM/DD`.
- Deduplicação por chave da NF-e.
- Controle incremental de `ultNSU`.
- Scheduler por intervalo em minutos.
- Retry com backoff linear.
- Logs estruturados em JSON.

## Como executar

1. Copie as variáveis de ambiente:

```bash
cp .env.example .env
```

2. Ajuste valores de `.env`:

- `SEFAZ_CNPJ`
- `SEFAZ_ENDPOINT`
- `SEFAZ_CERT_PFX_PATH`
- `SEFAZ_CERT_PFX_PASSPHRASE`
- `SEFAZ_MOCK=false` (para ambiente real)

3. Execute:

```bash
npm start
```

## Estrutura de saída

- XMLs: `data/{CNPJ}/{YYYY}/{MM}/{DD}/*.xml`
- Índice de deduplicação: `data/index.json`
- Estado NSU: `data/nsu-state.json`

## Observações importantes

- Este MVP não cobre todos os detalhes de schema e assinatura digital de produção.
- Em produção, recomenda-se validação XSD/XMLDSig robusta e armazenamento em banco com trilhas de auditoria.
