# Source Engine 2 Lite - ECS FPS Game

Um jogo de tiro em primeira pessoa (FPS) desenvolvido com **Three.js** e arquitetura **Entity Component System (ECS)**, inspirado no Source Engine.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Three.js](https://img.shields.io/badge/three.js-0.160.0-green.svg)

## 🎮 Sobre o Projeto

Este é um FPS modular e otimizado que utiliza técnicas avançadas de desenvolvimento de jogos, incluindo:

- **ECS (Entity Component System)** - Arquitetura modular e escalável
- **Query Caching** - Otimização de consultas de entidades
- **Fixed Timestep** - Simulação física consistente
- **Object Pooling** - Reutilização eficiente de objetos
- **Sistema de Saúde** - Gerenciamento de HP do jogador
- **Sistema de Áudio** - Efeitos sonoros imersivos

## ✨ Funcionalidades

- 🎯 Sistema de mira com crosshair
- 🔫 Sistema de tiro com munição e recarga
- 🏃 Movimento suave (WASD)
- 🦘 Pulo e agachamento
- 💡 Lanterna (toggle)
- 💊 Sistema de saúde e armadura
- 📊 HUD completo com informações do jogador
- 🎨 Efeitos visuais (vignette ao tomar dano)
- 📈 Debug info (FPS, posição, entidades)

## 🕹️ Controles

| Ação | Tecla |
|------|-------|
| Movimento | `W` `A` `S` `D` |
| Pular | `SPACE` |
| Agachar | `C` |
| Atirar | `LMB` (Botão Esquerdo do Mouse) |
| Recarregar | `R` |
| Lanterna | `F` |

## 🚀 Como Executar

### 🌐 Opção 1: GitHub Pages (Online - Recomendado)

**Jogue online gratuitamente!** Depois de publicar no GitHub:

1. Vá para **Settings** → **Pages** no seu repositório
2. Em **Source**, selecione `main` branch
3. Clique em **Save**
4. Seu jogo estará disponível em: `https://SEU_USUARIO.github.io/SEU_REPOSITORIO/`

### 💻 Opção 2: Servidor Local

Devido às políticas CORS dos navegadores modernos, é recomendado usar um servidor HTTP local:

#### Usando Python:
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### Usando Node.js (http-server):
```bash
npx http-server -p 8000
```

#### Usando PHP:
```bash
php -S localhost:8000
```

Depois, acesse: `http://localhost:8000`

### 📂 Opção 3: Abrindo Diretamente

Você também pode abrir o arquivo `index.html` diretamente no navegador, mas alguns recursos podem não funcionar devido às restrições CORS.

## 📁 Estrutura do Projeto

```
goodcollision modular/
├── index.html                         # Arquivo principal HTML
├── js/
│   ├── main.js                    # Ponto de entrada do jogo
│   ├── constants.js               # Constantes globais
│   ├── core/                      # Núcleo do ECS
│   │   ├── ECS.js                # Sistema ECS principal
│   │   ├── Entity.js             # Gerenciador de entidades
│   │   ├── Component.js          # Componentes do jogo
│   │   └── System.js             # Sistemas do jogo
│   ├── entities/                  # Definições de entidades
│   │   └── Player.js             # Entidade do jogador
│   ├── systems/                   # Sistemas do ECS
│   │   ├── InputSystem.js        # Sistema de entrada
│   │   ├── MovementSystem.js     # Sistema de movimento
│   │   ├── RenderSystem.js       # Sistema de renderização
│   │   ├── CollisionSystem.js    # Sistema de colisão
│   │   ├── HealthSystem.js       # Sistema de saúde
│   │   └── WeaponSystem.js       # Sistema de armas
│   └── map/                       # Geração e gerenciamento do mapa
│       └── MapGenerator.js       # Gerador de mapas
├── README.md                      # Este arquivo
└── .gitignore                     # Arquivos ignorados pelo Git
```

## 🛠️ Tecnologias Utilizadas

- **[Three.js](https://threejs.org/)** (v0.160.0) - Biblioteca 3D para WebGL
- **JavaScript ES6+** - Módulos ES6 para código modular
- **HTML5 & CSS3** - Interface e estilização

## 🎯 Arquitetura ECS

O jogo utiliza uma arquitetura **Entity Component System** que separa:

- **Entities (Entidades)**: Objetos do jogo (jogador, inimigos, projéteis)
- **Components (Componentes)**: Dados puros (posição, saúde, velocidade)
- **Systems (Sistemas)**: Lógica de processamento (movimento, renderização, colisão)

Esta arquitetura oferece:
- ✅ Melhor organização do código
- ✅ Maior reutilização de componentes
- ✅ Facilidade para adicionar novas funcionalidades
- ✅ Performance otimizada

## 🔧 Otimizações Implementadas

### Query Caching
Cache de consultas de entidades para evitar buscas repetitivas.

### Fixed Timestep
Simulação física com timestep fixo para comportamento consistente independente do FPS.

### Object Pooling
Reutilização de objetos (projéteis, partículas) para reduzir garbage collection.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer um fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Fazer commit das mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abrir um Pull Request

## 📝 Roadmap

- [ ] Sistema de inimigos com IA
- [ ] Múltiplos tipos de armas
- [ ] Sistema de partículas
- [ ] Menu de configurações
- [ ] Sistema de pontuação
- [ ] Múltiplos níveis/mapas
- [ ] Multiplayer (futuro)

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👤 Autor

**Marco**

## 🙏 Agradecimentos

- [Three.js](https://threejs.org/) - Pela incrível biblioteca 3D
- Comunidade de desenvolvimento de jogos
- Inspiração do Source Engine da Valve

---

⭐ Se você gostou deste projeto, considere dar uma estrela no repositório!
