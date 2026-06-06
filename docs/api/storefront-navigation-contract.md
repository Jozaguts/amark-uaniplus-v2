# Storefront Navigation — nuevo contrato (`GET /api/catalog/navigation`)

> **Cambio importante (2026-06-06):** la navegación ahora se construye desde la tabla
> `categories` (jerárquica, con `path`) en lugar de `catalog_navigation_items`.
> El bloque `menu` (mega-menú con `columns` / `items` / `images`) **fue eliminado**.
> La jerarquía completa se expone de forma uniforme en `children[]` recursivo.

## Endpoint

```
GET /api/catalog/navigation?locale=en
Accept: application/json
```

- Middleware: `tenant.api` (lectura pública, sin sesión).
- El tenant se resuelve por `Host`. **No** enviar `tenant_id`.
- `locale` es opcional (`en` por defecto).

## Estructura de la respuesta

```jsonc
{
  "version": "2026-06-06T12:00:00.000000Z",  // string|null — cambia cuando cambia la nav (sirve para cache-busting)
  "max_depth": 4,                            // int — profundidad máxima del árbol
  "items": [ /* nodos raíz */ ]
}
```

Tras la limpieza de raíces, `items` contiene **exactamente 3 nodos raíz**: `women`, `men`, `pet`.

### Forma de cada nodo (idéntica en todos los niveles)

```jsonc
{
  "id": 1,
  "type": "category",          // siempre "category"
  "name": "Women",             // string PLANO (ya no es objeto {en, es})
  "slug": "women",
  "path": "women",             // sin slash inicial/final. Ej: "women/clothing/shop-by-category/tops"
  "url": "/women/",            // path envuelto en slashes
  "level": 1,                  // 1 = raíz, 2, 3, 4...
  "sort_order": 0,
  "is_active": true,
  "children": [ /* mismos nodos, recursivo */ ],

  // Opcionales — sólo presentes si tienen valor:
  "description": "…",
  "seo_title": "…",
  "seo_description": "…"
}
```

### Ejemplo real (recortado)

```jsonc
{
  "version": "2026-06-06T12:00:00.000000Z",
  "max_depth": 4,
  "items": [
    {
      "id": 1, "type": "category", "name": "Women", "slug": "women",
      "path": "women", "url": "/women/", "level": 1, "sort_order": 0, "is_active": true,
      "children": [
        {
          "id": 2, "type": "category", "name": "Clothing", "slug": "clothing",
          "path": "women/clothing", "url": "/women/clothing/", "level": 2, "sort_order": 1, "is_active": true,
          "children": [
            {
              "id": 3, "type": "category", "name": "Shop by Category", "slug": "shop-by-category",
              "path": "women/clothing/shop-by-category", "url": "/women/clothing/shop-by-category/",
              "level": 3, "sort_order": 0, "is_active": true,
              "children": [
                {
                  "id": 4, "type": "category", "name": "Tops", "slug": "tops",
                  "path": "women/clothing/shop-by-category/tops",
                  "url": "/women/clothing/shop-by-category/tops/",
                  "level": 4, "sort_order": 18, "is_active": true,
                  "children": []
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

## Qué cambió respecto al contrato anterior

| Antes (`catalog_navigation_items`) | Ahora (`categories`) |
|---|---|
| Mega-menú en `item.menu.columns[].items[].children[]` | Árbol uniforme en `item.children[]` recursivo |
| `item.menu.images[]` (promociones) | **Eliminado** (eran de `catalog_navigation_promotions`, legacy) |
| `name` como objeto traducible `{ "en": "...", "es": "..." }` | `name` es **string plano** |
| Nodos de menú con clave `label` | Siempre `name` |
| Campos `badge`, `icon`, `italic` | **Ya no se emiten** |
| Raíces variables (incluían provider/legacy) | **Sólo** `women`, `men`, `pet` |

## Cómo debe consumirlo el front

- Renderizar el menú **recursivamente** sobre `item.children[]`, en lugar de leer `menu.columns`.
- Para construir la URL/ruta de cada entrada usar `path` (recomendado) o `url`.
    - El detalle de categoría se obtiene con:
      `GET /api/storefront/catalog/categories/{path}/products` (incluye productos de la categoría y sus descendientes).
- Para el "mega-menú" de nivel 1: las columnas son simplemente los hijos directos
  (`level 2`), y dentro de cada columna sus hijos (`level 3`, `level 4`). Es decir,
  lo que antes era `menu.columns` ahora es `item.children` directamente.

### Pseudocódigo de render

```ts
function renderNode(node) {
  // node.name, node.path, node.url, node.level
  // node.children -> array (puede estar vacío)
  return node.children.map(renderNode);
}

payload.items.forEach(renderNode); // items = [women, men, pet]
```
