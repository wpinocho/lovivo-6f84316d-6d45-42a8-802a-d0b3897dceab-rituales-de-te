# Plan: Redisenar Etiquetas de Producto con Colores Globales

## Problema Actual

Las etiquetas (badges) en el `ProductCardUI` usan colores hardcodeados de Tailwind que no respetan el sistema de diseño global:


| Etiqueta           | Color actual               | Problema                        |
| ------------------ | -------------------------- | ------------------------------- |
| Descuento (`-15%`) | `bg-red-500 text-white`    | Hardcodeado, no cambia con tema |
| Destacado          | `bg-orange-500 text-white` | Hardcodeado, no cambia con tema |
| Agotado            | `bg-gray-600 text-white`   | Hardcodeado, no cambia con tema |


En contraste, `VolumeBadge`, `BOGOLabel` y `PriceRuleBadge` ya usan variables CSS globales (`bg-primary`, `bg-accent`), lo cual es correcto.

## Solucion

Reemplazar los colores hardcodeados por las variables del design system definidas en `index.css`. Asi cuando alguien use el template y cambie `--primary`, `--destructive`, `--muted`, etc., las etiquetas se actualizan automaticamente.

### Mapeo de colores propuesto


| Etiqueta  | Antes                      | Despues                                      | Razon                                                              |
| --------- | -------------------------- | -------------------------------------------- | ------------------------------------------------------------------ |
| Descuento | `bg-red-500 text-white`    | `bg-destructive text-destructive-foreground` | Descuento = urgencia, `destructive` es el token semantico para eso |
| Destacado | `bg-orange-500 text-white` | `bg-primary text-primary-foreground`         | Destacado = importancia principal                                  |
| Agotado   | `bg-gray-600 text-white`   | `bg-muted text-muted-foreground`             | Agotado = estado inactivo/neutral                                  |


### Mejora visual

Ademas de los colores, mejorar ligeramente el estilo para que se vean mas refinadas:

- Agregar `rounded-sm` en vez de `rounded` para un look mas moderno y consistente con el sistema de shadcn
- Reducir ligeramente el padding para que sean mas compactas y elegantes

## Archivo a modificar

### `src/components/ui/ProductCardUI.tsx`

Solo 3 lineas cambian dentro del bloque de badges (lineas 73-87):

```tsx
// Descuento
<span className="bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-sm font-medium">

// Destacado  
<span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-sm font-medium">

// Agotado
<span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-sm font-medium">
```

**Un solo archivo, 3 lineas de cambio.** Las etiquetas de `VolumeBadge`, `BOGOLabel` y `PriceRuleBadge` ya estan correctas con colores globales.