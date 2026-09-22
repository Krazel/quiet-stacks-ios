# Quiet Stacks 0.18 (1)

Carrito con doce huecos persistentes ajustados a las dos baldas. Los libros se
pueden colocar en cualquier hueco e intercambiar por arrastre; sacar uno deja su
espacio vacío. Retirados los iconos del resumen. Guardados anteriores conservados.

El suelo sustituye G por la tapa suavizada L aprobada, sin volver a normalizarla.
Cada reproducción varía aleatoriamente entre −1,5 y +1,5 semitonos. El volumen
de efectos se respeta; estanterías y carrito conservan sus sonidos anteriores.

Disponible en TestFlight interno; Apple VALID / IN_BETA_TESTING. Sin beta externa
ni publicación en App Store.

118 pruebas fuente y 117 de distribución pasan. QA de audio con ratón y táctil
emulado confirma L y pitch variable en cada caída, sin errores JavaScript.
QA nativa en simuladores iPhone/iPad: arranque, conservación de partida, interfaz,
historia, diagnóstico e informe compartible correctos. Sin pérdida de contexto
gráfico y sin dibujar libros durante reposo. No sustituye la prueba física.

IPA arm64 firmada y sus 44 recursos exactos verificados contra el commit publicado.
Commit `2bef74fe690ee34018bec0643e5d82651b515ecb`, CI `35769190518`.
Build Apple `35e89f84-8f55-44a3-a455-d2ebdf4930ca`.
IPA SHA-256 `a9b23383dd0880a6052a6ed5402fe301e37e3c29e7d98bf42938f937b049e695`.
Audio L SHA-256 `654c86c30d1e4978282f39fccc7e182e4b7d71f53056ba8a1a53256e10e70e1b`.

Evidencias: `artifacts/floor-audio-0180/verification.json`,
`artifacts/native-0180-verification.json`, `artifacts/ios-testflight-0180-upload.json`
y `artifacts/testflight-0180-verification.json`.
