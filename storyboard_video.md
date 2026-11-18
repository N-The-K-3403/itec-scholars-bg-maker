# Storyboard do vídeo (máx. 3:00, alvo 2:45)

Todos os números abaixo vêm de `dados_video.json` (conferido contra `resultados_10.txt`).

## Mensagem única do vídeo
> A cidade mede onde se morre, não onde se mora. E isso faz a periferia parecer menos arriscada do que é.

## Cena a cena

| # | Tempo | O que FALA | O que MOSTRA | Dado (campo do JSON) |
|---|-------|-----------|--------------|----------------------|
| 1 | 0:00–0:20 | "3.896 pedestres e motociclistas morreram no trânsito de São Paulo entre 2022 e 2026. O gestor decide onde agir olhando o mapa de onde os sinistros acontecem. Nós perguntamos: de onde vêm essas vítimas?" | Número 3.896 grande, contando de 0. Barras pequenas por ano (716, 757, 869, 887, 667 parcial). | `headline.obitos_infosiga_2022_2026`, `headline.por_ano` |
| 2 | 0:20–0:50 | "Nossa primeira hipótese era renda e transporte público no horário de pico. Testamos e ela não se sustentou: o Infosiga não tem renda nem residência da vítima. Em vez de forçar, perguntamos por que a base não responde. Isso virou a tese." | Hipótese riscada, aparece a tese: "onde se morre ≠ onde se mora". | (texto) |
| 3 | 0:50–1:15 | "Buscamos a residência fora das bases do desafio, no SIM da Prefeitura, e definimos antes o que derrubaria a tese: se os dois mapas fossem iguais, a correlação ficaria perto de 1." | Diagrama: Pergunta → Hipótese → "o que derrubaria" → Teste Infosiga x SIM. | `meta` |
| 4 | 1:15–1:55 | "O resultado: os distritos de menor renda concentram 59% dos moradores mortos, mas só 43% das mortes ocorridas. Nos de maior renda é o inverso: 15% contra 27%. A correlação entre os dois mapas é 0,59, moderada: as duas réguas não medem o mesmo risco." | **Mapa lado a lado** (onde se mora x onde se morre), depois barras por tercil. | `tercis[*].pct_moradores / pct_ocorridas`, `headline.spearman` |
| 5 | 1:55–2:15 | "Itaim Bibi não tem nenhum morador morto, mas 44 mortes acontecem lá. Grajaú e Brasilândia fazem o caminho oposto." | Dois cartões: Itaim Bibi (0 → 44) e Brasilândia (24 → 31, 3,8% → 1,0%). | `distritos[]` |
| 6 | 2:15–2:40 | "A solução é simples: um painel com as duas réguas lado a lado, sem ranking único. O gestor vê onde se morre e de onde as vítimas vêm, e prioriza na proporção do risco real." | Mockup do painel: mapa duplo + seletor de distrito. | — |
| 7 | 2:40–3:00 | "Usamos só dados agregados e dizemos que os dados indicam, não provam. Residência é de 2024 e comparamos distritos, não pessoas. Próximo passo: residência de 2022 a 2024. O método é repetível em outras cidades." | Limitações em 3 linhas + logo ITEC. | `meta.aviso` |

## Achados que NÃO estavam na ficha (novos, já calculados)

1. **Taxa de moradores mortos por 100 mil habitantes (SIM 2024):** 6,6 no tercil de menor renda, 5,0 no intermediário, 3,4 no de maior renda. Quase o dobro entre a periferia e o centro rico. É um argumento mais forte que a parcela percentual.
2. **Cuidado com a parcela:** o tercil de menor renda tem 48,7% da população (os tercis são de 32 distritos cada, não de população igual). Então 59% dos mortos x 49% da população é a comparação honesta. A taxa por 100 mil acima já resolve isso.
3. **7 distritos têm mortes ocorridas e zero moradores mortos:** Itaim Bibi (44), Bom Retiro (29), Mooca (17), Barra Funda (15), Pari (12), Liberdade (8) e mais um.

## Decisões que o grupo precisa tomar

- Usar o achado 1 (6,6 x 3,4 por 100 mil) no minuto 1:15–1:55? Eu recomendo: entra como segunda frase da cena 4.
- Quem fala cada cena (se gravarem juntos).
- Mostrar o mapa duplo na cena 4 (precisa do `distritos-sp.geojson` renderizado, que ainda não está feito).

## Pendências e riscos

- **Fonte da renda e da população:** a ficha ficou com `[COLAR A FONTE REAL]`. Os arquivos são `perfil_distritos.csv` e `populacao_distritos.csv`. Confirmar a origem antes de gravar, caso a mentoria pergunte.
- **Rodovias (71,1% x 45,5%):** esse número é "% dos casos graves ou fatais que foram fatais". Inclui registros "não disponível", que são 100% fatais. Por isso não está no roteiro. Se usar, dizer "entre os casos graves ou fatais".
- **Mortes ocorridas:** só 81% têm coordenada válida (3.156 de 3.896). Dizer "mortes com localização válida".
