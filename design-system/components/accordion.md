# Accordion

Componente: `apps/web/src/components/ui/accordion.tsx` (`Accordion`,
`AccordionItem`, `AccordionTrigger`, `AccordionPanel`), sobre
`@base-ui/react/accordion`. Introducido para la sección de FAQ de la
landing page — es el mismo patrón a reutilizar en cualquier otro lugar de
la app que necesite contenido colapsable (por ahora solo el FAQ).

## Anatomía

```tsx
<Accordion>
  <AccordionItem value="q1">
    <AccordionTrigger>¿Qué es Aura?</AccordionTrigger>
    <AccordionPanel>Respuesta…</AccordionPanel>
  </AccordionItem>
</Accordion>
```

Por defecto solo un ítem puede estar abierto a la vez (`multiple: false` en
Base UI) — no se pasa ninguna prop extra para lograrlo, es el
comportamiento por defecto del primitivo.

## Receta visual

| Parte | Receta |
|---|---|
| `AccordionItem` | `border-b border-border-subtle`, sin borde en el último ítem |
| `AccordionTrigger` | `py-5 text-base font-medium`, hover `text-brand-purple-light`, ícono `ChevronDown` que rota 180° vía `group-data-[panel-open]:rotate-180` |
| `AccordionPanel` | Anima su altura real (`height: var(--accordion-panel-height)`) con `duration-300 ease-(--ease-aura)` — nunca un `max-height` fijo arbitrario, que se corta mal con contenido de longitud variable |

## Reglas de uso

1. El ícono de expansión (`ChevronDown`) vive dentro de `AccordionTrigger`,
   no se agrega por fuera — mantiene el estado visual sincronizado con el
   atributo `data-panel-open` del primitivo en vez de un `useState` propio.
2. La animación de apertura usa la altura real del contenido (expuesta por
   Base UI como la variable `--accordion-panel-height`), no una animación
   de opacidad sola — un acordeón que solo hace fade sin expandir el
   espacio dejaría un hueco en blanco antes de que aparezca el texto.
