# 20 principios de UX y animación — cómo los aplicamos en Posta

Referencia para diseñar e implementar UI en la app (Expo + Reanimated 4 + Gesture Handler + `src/lib/haptics.ts`).
Fuentes: userinterface.wiki (12 principios, R. Salaja), emilkowal.ski ("You don't need animations", "Great animations"),
NN/g ("Animation purpose", "Response times: 3 limits"), lawsofux.com, Apple HIG / Material (tamaños de toque).

## Antes de animar algo: 3 preguntas

1. **¿Para qué sirve?** Feedback, cambio de estado, orientación espacial o señal de que algo se puede tocar/arrastrar. "Queda lindo" no alcanza.
2. **¿Cada cuánto se ve?** (principio 20). Cuanto más frecuente, menos animación.
3. **¿Cuánto dura?** Interacciones < 300 ms. Más largo solo para momentos únicos (festejos, onboarding).

Siempre: animar solo `transform` y `opacity`, que sea interrumpible (springs con `velocity`), y respetar `useReducedMotion()` (fade en vez de movimiento).

## Escala de tiempos y curvas (usar siempre las mismas)

| Uso | Duración | Curva |
|---|---|---|
| Press / feedback de toque | 100–160 ms | ease-out |
| Tooltip, popover, chip | 150–200 ms | ease-out |
| Sheet, modal, cambio de pantalla | 220–300 ms | ease-out fuerte `Easing.bezier(0.23, 1, 0.32, 1)` o spring |
| Salida de algo | ~20 % más corta que la entrada | ease-in |
| Festejo / momento único | 400–900 ms | spring con rebote |

Springs en Reanimated: `withSpring(v, { duration, dampingRatio })`. Sin rebote para UI utilitaria (`dampingRatio: 1`), un poco para lo vivo (`0.7–0.8`), mucho solo para festejos (`0.55–0.65`, ya lo usamos en 460–520 ms). Para gestos, pasar `velocity: e.velocityX` así el soltar continúa el movimiento.

## Los 12 principios de animación

| # | Principio | Qué es en UI | En Posta | Cuidado |
|---|---|---|---|---|
| 1 | **Squash & stretch** | Deformar un poco al chocar/moverse para dar peso | Al caer una ficha en su lugar o al aparecer la llama de racha: `scaleX 1.04 / scaleY 0.96` → 1 | Sutil. Más que eso parece dibujo animado |
| 2 | **Anticipation** | Un pequeño gesto antes de la acción principal | Botón "Check" se hunde (scale 0.96) al apretar y la acción sale al soltar; Pancho se agacha antes de saltar en el festejo | Solo en momentos que importan; en todo, la app se siente lenta |
| 3 | **Staging** | Llevar la mirada a una sola cosa | Respuesta incorrecta: se oscurece el resto y entra la hoja con la corrección; una sola cosa se mueve a la vez | Nada de varias animaciones compitiendo |
| 4 | **Pose to pose** | Definir estados inicio/fin y que el motor interpole | Componentes con estados claros (`idle / pressed / correct / wrong`) y transición entre ellos | No animar lo que no necesita animarse |
| 5 | **Follow through** | Las partes frenan a distinto tiempo, overshoot y se acomodan | Springs con leve rebote al soltar una carta; stagger de 30–50 ms en las opciones de respuesta | Stagger total < ~250 ms o se siente lento |
| 6 | **Slow in & slow out** | Nunca velocidad constante | Entradas ease-out (llega rápido, frena suave), salidas ease-in | `linear` solo para spinners y barras de progreso |
| 7 | **Arcs** | Moverse en curva | Monedas/XP que vuelan al contador; sticker que va al álbum (x lineal, y con ease distinta) | En UI utilitaria, línea recta está bien |
| 8 | **Secondary action** | Detalle que acompaña sin robar foco | Check que aparece + chispitas + haptic `success` + sonido corto al acertar | El detalle no es el mensaje |
| 9 | **Snappy timing** | La duración define la sensación | Usar la escala de arriba; mismo tipo de elemento = misma duración en toda la app | 150 ms se siente responsivo; 400 ms en lo mismo se siente roto |
| 10 | **Exaggerated feedback** | Exagerar para que el momento se sienta | Lección perfecta, racha, fin de unidad: scale grande, confetti, Pancho festejando | Solo en momentos raros |
| 11 | **Solid drawing (3D)** | Profundidad: sombras, capas, perspectiva | Botones con "borde inferior" que baja al apretar (estilo 3D), sombras consistentes por nivel de elevación, flip de tarjeta con `perspective` | Mismo sistema de sombras en todos lados |
| 12 | **Appeal** | La suma de todo hecho con cuidado | Revisión de detalles en cada pantalla | La buena animación no se nota: se siente |

## Las 8 leyes de UX

| # | Ley | Regla | En Posta |
|---|---|---|---|
| 13 | **Fitts** | Más grande y más cerca = más rápido de tocar | Botón principal ancho completo, abajo (zona del pulgar); audio al lado de la palabra que suena |
| 14 | **Bigger hit areas** | El área tocable puede ser mayor que lo visible. Mínimo 44×44 pt (iOS) / 48×48 dp (Android), ~8 pt entre objetivos | Íconos chicos (cerrar, parlante, info) con `hitSlop` hasta llegar a 44; ojo que hoy hay `hitSlop={4}` y `={6}` en íconos chicos |
| 15 | **Hick** | Más opciones = decisión más lenta | Una pregunta por pantalla, una acción destacada ("Continue"), opciones avanzadas escondidas, onboarding progresivo. Sin simplificar de más |
| 16 | **Miller** | ~7±2 cosas en la memoria → agrupar | Palabras nuevas por lección en grupos chicos, listas por tema, conjugaciones en tablas agrupadas. No usarlo como límite rígido |
| 17 | **Doherty** | Feedback en < 400 ms | Tap: < 100 ms (sentirse directo). Corrección de respuesta: inmediata, local. > 1 s: skeleton o Pancho animado. > 10 s: barra de progreso. UI optimista (marcar como hecho y sincronizar después) |
| 18 | **Postel** | Aceptar entrada desprolija, devolver limpia | Respuestas escritas que aceptan sin tildes, mayúsculas, puntuación, espacios extra; mostrar la forma correcta en el feedback ("Correcto: *está*") |
| 19 | **Jakob** | La gente espera que funcione como las apps que ya usa | Tab bar abajo, swipe atrás, sheets que se cierran tirando para abajo, patrones tipo Duolingo en clase (botón Check abajo, hoja verde/roja) |
| 20 | **Frequency of use** | Lo que se usa mucho, se anima poco | Tabs, teclado, botón "Check" en cada pregunta: casi sin animación. Festejos y pantallas únicas: todo el show. Menús: abrir instantáneo, animar solo la salida |

## Cosas puntuales para revisar en la app

- `hitSlop` chicos (4/6) en íconos: verificar que el área total llegue a 44 pt.
- Hay muchas duraciones distintas (160, 180, 200, 220, 240, 260, 280, 300, 320…): unificar en tokens (`fast 150`, `base 220`, `slow 300`).
- `useReducedMotion` está solo en algunas pantallas; llevarlo a los componentes compartidos.
