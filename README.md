# runpack-mobile

App React Native + Expo do RunPack.

## Setup

```bash
npm install
npm run ios      # iOS
npm run android  # Android
```

## Estrutura

```
app/              Rotas Expo Router (telas finas — sem lógica)
features/         Implementação por domínio (hooks + services)
shared/           Componentes, hooks e utils reutilizáveis
store/            Zustand stores (auth, session)
constants/        Tema, config de API, enums
```

## Variáveis de ambiente

Criar `.env.local`:
```
EXPO_PUBLIC_API_URL=http://localhost:8080
EXPO_PUBLIC_WS_URL=ws://localhost:8080/ws
```

## Referência

Ver `../runpack-docs/CLAUDE.md` para contratos de API, modelo de dados e regras de negócio.
