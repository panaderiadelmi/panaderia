# 🍞 Delmi Soriano — Landing Page Premium Dark Mode

> Sitio web premium en modo oscuro para la panadería artesanal **Delmi Soriano**.
> Generado con imágenes de IA, diseño "Dark Luxury" y animaciones premium.

---

## 📁 Estructura del Proyecto

```
webpanaderia/
├── index.html          # Página principal completa
├── styles.css          # Sistema de diseño Dark Luxury completo
├── script.js           # Interacciones, animaciones y flip cards
├── README.md           # Este archivo
└── images/
    ├── logo.png         # Logo minimalista (512x512px)
    ├── hero_visual.png  # Visual principal del hero (circular)
    ├── service_1.png    # Pan de Masa Madre
    ├── service_2.png    # Bollería Francesa (croissants)
    ├── service_3.png    # Obrador Artesanal (amasado)
    ├── service_4.png    # Repostería de Ocasión (tartas)
    ├── service_5.png    # Ingredientes Premium (trigo, harina)
    └── service_6.png    # Pedidos & Entrega (packaging)
```

---

## 🎨 Sistema de Colores

| Variable CSS | Valor | Uso |
|---|---|---|
| `--primary-500` | `#3B82F6` | Azul Eléctrico (principal) |
| `--secondary-500` | `#22C55E` | Verde Neón (acento) |
| `--bg-primary` | `#000000` | Fondo negro puro |
| `--bg-secondary` | `#09090B` | Fondo secciones alternas |
| `--text-primary` | `#FFFFFF` | Textos principales |
| `--text-tertiary` | `#A1A1AA` | Textos secundarios |

---

## ✨ Características Implementadas

### Diseño
- ✅ **Dark Luxury** — Fondo negro puro con acentos azul + verde
- ✅ **Glassmorphism** — Cards con blur, saturación y bordes translúcidos
- ✅ **Gradiente dinámico** — Botones con `gradient-shift` animado
- ✅ **Glow effects** — Luces de neón en hero, logo, botones CTA
- ✅ **Tipografía** — Plus Jakarta Sans (títulos) + Inter (cuerpo)

### Interacciones
- ✅ **Flip Cards 3D** — Los 6 servicios con efecto flip al hover (desktop) y tap (mobile)
- ✅ **50 partículas flotantes** — Sistema dinámico con JavaScript
- ✅ **Navbar sticky** — Con blur y borde al hacer scroll
- ✅ **Menú hamburguesa** — Para mobile con animación suave
- ✅ **Scroll reveal** — Elementos aparecen con stagger al entrar en viewport
- ✅ **Contadores animados** — Estadísticas con easing easeOutExpo
- ✅ **Parallax suave** — En el gradiente del hero
- ✅ **Smooth scroll** — En todos los links de navegación

### Secciones
1. 🏠 **Hero** — Título + CTA + imagen flotante + anillos giratorios + estadísticas
2. 🏆 **Social Proof** — Reconocimientos (Premio Artesano, 5 estrellas...)
3. 🍞 **Servicios** — 6 flip cards con imágenes de IA generadas
4. 📊 **Nuestra Historia** — Grid con métricas animadas + badge de award
5. ⚙️ **Proceso** — 4 pasos "Del Trigo a Tu Mesa"
6. 💬 **Testimonios** — 3 cards con glassmorphism
7. 🧑‍🍳 **Nosotros** — Logo con anillos, historia y valores
8. 🚀 **CTA Final** — Call to action con botón WhatsApp + teléfono
9. 🗂️ **Footer** — 4 columnas con links y datos de contacto

### Responsive
- ✅ Desktop XL (1440px+)
- ✅ Desktop (1024–1439px)
- ✅ Tablet (768–1023px) — 2 columnas
- ✅ Mobile (< 768px) — 1 columna + hamburguesa

---

## 🔧 Cómo Personalizar

### 1. Cambiar número de teléfono / WhatsApp
En `index.html`, buscar:
```html
href="https://wa.me/TUNUMEROAQUI"   <!-- WhatsApp -->
href="tel:+34000000000"              <!-- Teléfono -->
```

### 2. Cambiar correo electrónico
En `index.html`, buscar:
```
hola@delmisoriano.com
```

### 3. Cambiar ciudad / ubicación
En `index.html`, buscar:
```
Tu Ciudad, España
```

### 4. Cambiar color principal
En `styles.css`, modificar:
```css
--primary-500: #3B82F6;   /* Cambia este HEX */
--primary-rgb: 59, 130, 246;  /* RGB equivalente */
```

### 5. Cambiar redes sociales
En `index.html`, buscar los `<a href="#">` con `aria-label="Instagram"` y `aria-label="Facebook"`.

---

## 🚀 Publicar en Internet

### Opción 1: GitHub Pages (gratuito)
1. Crea un repositorio en GitHub
2. Sube todos los archivos
3. Ve a Settings → Pages → Deploy from main

### Opción 2: Netlify (gratuito)
1. Ve a [netlify.com](https://netlify.com)
2. Arrastra la carpeta del proyecto
3. ¡Listo! En segundos tendrás URL pública

### Opción 3: Hosting tradicional
Sube todos los archivos por FTP a la carpeta raíz del hosting.

---

## 📝 Notas

- El enlace de WhatsApp **debe actualizarse** con el número real
- Las imágenes fueron generadas con IA y pueden reemplazarse con fotografías reales
- Para añadir Google Analytics: insertar el script en `<head>` de `index.html`

---

*© 2026 Delmi Soriano · Panadería Artesanal Premium · Dark Luxury Landing Page*
