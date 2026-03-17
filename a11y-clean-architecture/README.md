# a11y.io | Requirements Assistant

Aplicação web para transformar respostas sobre contexto de interface em:

- recomendações WCAG 2.2
- princípios Gaia
- técnicas de implementação
- User Story
- cenário BDD

## Arquitetura

A estrutura segue uma adaptação pragmática de Clean Architecture:

- `domain/`: regras centrais e montagem de artefatos
- `application/`: casos de uso e validação de entrada
- `infrastructure/`: fonte de dados em JSON
- `interfaces/`: HTTP e entrega do frontend
- `public/`: interface web estática

## Executar localmente

```bash
npm install
npm run dev
```

A aplicação ficará disponível em `http://localhost:3000`.

## Deploy

O projeto está preparado para deploy simples em plataformas como Render, porque:

- serve frontend e API no mesmo processo
- usa `API_BASE = '/api'`
- inclui `render.yaml`

## Observação de código limpo

Os comentários foram mantidos apenas onde agregam contexto não óbvio. O objetivo é que o nome dos arquivos, funções e variáveis explique o comportamento sem depender de comentário excessivo.
