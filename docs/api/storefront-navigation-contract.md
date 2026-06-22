# Storefront Navigation — contrato para el front (`GET /api/catalog/navigation`)

> **Cambio importante (2026-06-22):** la navegación ahora se construye desde
> `categories` como única fuente de verdad. Ya no existen `CategorySection`,
> `Subcategory`, `catalog_navigation_items` ni promociones legacy como contrato
> para el storefront.
>
> La jerarquía real se expone en `children[]` y está limitada a máximo 3 niveles.
> La organización visual del mega-menú se expone aparte en `menu_groups[]`.
>
> La fuente declarativa actual para poblar la navegación es
> `docs/navigation_complete_structure.json`. Sus llaves (`categories`,
> `subcategories`, `children`) son estructura del documento, no nombres de
> tablas.

## Endpoint

```
GET /api/catalog/navigation?locale=en
Accept: application/json
```

- Middleware: `tenant.api` (lectura pública, sin sesión).
- El tenant se resuelve por `Host`. **No** enviar `tenant_id`.
- Usar el dominio tenant del storefront. Ejemplo:
  `http://uandiplus.test/api/catalog/navigation?locale=en`.
- No usar `b.test` para leer catálogo tenant; `b.test` es central/admin.
- `locale` es opcional (`en` por defecto).

## Estructura de la respuesta

```jsonc
{
  "version": "2026-06-06T12:00:00.000000Z",  // string|null — cambia cuando cambia la nav (sirve para cache-busting)
  "max_depth": 3,                            // int — profundidad máxima del árbol
  "items": [ /* nodos raíz */ ]
}
```

Tras la limpieza de raíces, `items` contiene **exactamente 3 nodos raíz**:
`women`, `men`, `collection`. Ningún `path` público debe exceder tres segmentos, por
ejemplo `women/clothing/tshirts`.

`slug` se expone como el último segmento de `path`. Como la tabla conserva un
índice legacy único sobre `categories.slug`, el backend puede guardar un slug
interno con sufijo para resolver colisiones, pero el contrato público debe
tratar `path` como identificador real.

### Forma de cada nodo (idéntica en todos los niveles)

```jsonc
{
  "id": 1,
  "type": "category",          // siempre "category"
  "name": "Women",             // string PLANO (ya no es objeto {en, es})
  "slug": "women",             // último segmento de path; usar path para navegar
  "path": "women",             // sin slash inicial/final. Ej: "women/clothing/tops"
  "url": "/women/",            // path envuelto en slashes
  "level": 1,                  // 1 = raíz, 2, 3. Nunca mayor a 3
  "sort_order": 0,
  "is_active": true,
  "is_clickable": false,      // sólo true autoriza al front a crear un enlace
  "children": [ /* categorías reales hijas, máximo nivel 3 */ ],
  "menu_groups": [ /* opcional, sólo presentación del mega-menú */ ],

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
  "max_depth": 3,
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
              "id": 3, "type": "category", "name": "Tops", "slug": "tops",
              "path": "women/clothing/tops", "url": "/women/clothing/tops/",
              "level": 3, "sort_order": 18, "is_active": true,
              "children": []
            }
          ],
          "menu_groups": [
            {
              "id": 1,
              "title": "Shop by Category",
              "sort_order": 0,
              "items": [
                {
                  "id": 3, "type": "category", "name": "Tops", "slug": "tops",
                  "path": "women/clothing/tops",
                  "url": "/women/clothing/tops/",
                  "level": 3, "sort_order": 18, "is_active": true
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
| Mega-menú en `item.menu.columns[].items[].children[]` | Grupos visuales en `item.menu_groups[].items[]` |
| `item.menu.images[]` (promociones) | **Eliminado** (eran de `catalog_navigation_promotions`, legacy) |
| `name` como objeto traducible `{ "en": "...", "es": "..." }` | `name` es **string plano** |
| Nodos de menú con clave `label` | Siempre `name` |
| Campos `badge`, `icon`, `italic` | **Ya no se emiten** |
| Raíces variables (incluían provider/legacy) | **Sólo** `women`, `men`, `collection` |
| Grupos como `shop-by-category`, `trending`, `occasion` dentro del path | No son categorías; son `menu_groups.title` |
| Productos ligados a `subcategory_id` / `category_id` legacy | Productos ligados a `category_product` |

## Cómo se importa `docs/navigation_complete_structure.json`

- `navigation.women`, `navigation.men` y `navigation.collection` son las únicas raíces.
- Cada item en `categories[]` se convierte en categoría nivel 2.
- Cada item en `subcategories[]` sin `children[]` se convierte en categoría nivel 3.
- Cada item en `subcategories[]` con `children[]` se convierte en `menu_groups[]` para la categoría nivel 2.
- Cada child dentro de ese grupo se convierte en categoría nivel 3 y en item del grupo.
- Si un nodo nivel 2 trae sólo `subcategories[]` planas, el backend puede crear
  grupos visuales derivados sin cambiar las categorías reales. Para secciones
  tipo `New Today`/`New`, los items antes de `Trending` van bajo `Just In` y
  `Trending` más los siguientes van bajo `Trending`.
- El importador elimina categorías que no estén representadas en el JSON.
- Si el JSON no trae traducciones explícitas, `name_translations` y
  `title_translations` se llenan con el mismo label en `en` y `es` como fallback.

## Cómo debe consumirlo el front

- Renderizar la navegación principal desde `payload.items`.
- Renderizar categorías reales desde `node.children[]`.
- Crear enlaces sólo cuando `node.is_clickable === true`.
- Si `is_clickable` es `false` o no existe, renderizar texto o un trigger y no usar `url`.
- Renderizar columnas visuales del mega-menú desde `node.menu_groups[]` cuando exista.
- Para construir links usar `node.path` como fuente principal o `node.url` si el router acepta ese formato.
- No usar `label`; usar siempre `name`.
- No leer `section`, `subcategory`, `menu.columns`, `menu.images`, `badge`, `icon` ni `italic`.
- No crear paths desde grupos visuales. `menu_groups[].title` es sólo un encabezado de columna.
- Cada item dentro de `menu_groups[].items[]` es una categoría real; sólo es navegable cuando `is_clickable === true`.
- El detalle/listado de productos por categoría se obtiene con:
  `GET /api/storefront/catalog/categories/{path}/products`.
- El endpoint de productos por categoría incluye productos asignados a esa categoría y a sus descendientes.

### Reglas de routing en el front

El front debe tratar `path` como identificador público de categoría:

```ts
const categoryHref = `/${node.path}`;
const categoryProductsEndpoint = `/api/storefront/catalog/categories/${node.path}/products`;
```

Ejemplos válidos:

```txt
/women
/women/clothing
/women/clothing/tshirts
/women/accessories/bags
/collection/summer
```

Ejemplos inválidos:

```txt
/women/shop-by-category/tshirts
/women/clothing/shop-by-category/tshirts
/women/clothing/tshirts/new-arrivals
```

La razón: `shop-by-category`, `trending`, `occasion` o cualquier agrupador visual
no son categorías reales. Si se necesitan como columnas del mega-menú, vienen en
`menu_groups[]`.

### Reglas de render del mega-menú

Para cada nodo:

1. Si tiene `menu_groups[]`, usar esos grupos como columnas visuales.
2. Si no tiene `menu_groups[]`, se puede usar `children[]` como columnas/lista simple.
3. Cada `menu_groups[].items[]` usa `item.name`; sólo crea un link con `item.path` cuando `is_clickable === true`.
4. No asumir cantidad fija de columnas; pueden existir 0, 1 o N grupos.
5. No asumir que `items` sólo existe en nivel 1. Cualquier categoría puede tener `menu_groups[]`, aunque normalmente se usará en nivel 2.

### Pseudocódigo de render

```ts
type NavigationNode = {
  id: number;
  type: 'category';
  name: string;
  slug: string;
  path: string;
  url: string;
  level: 1 | 2 | 3;
  sort_order: number;
  is_active: boolean;
  is_clickable: boolean;
  children: NavigationNode[];
  menu_groups?: MenuGroup[];
};

type MenuGroup = {
  id: number;
  title: string;
  sort_order: number;
  items: NavigationNode[];
};

function hrefForCategory(node: NavigationNode) {
  return `/${node.path}`;
}

function productsEndpointForCategory(node: NavigationNode) {
  return `/api/storefront/catalog/categories/${node.path}/products`;
}

function renderMegaMenuColumns(node: NavigationNode) {
  if (node.menu_groups?.length) {
    return node.menu_groups.map((group) => ({
      title: group.title,
      links: group.items.map((item) => ({
        label: item.name,
        href: hrefForCategory(item),
      })),
    }));
  }

  return node.children.map((child) => ({
    title: child.name,
    links: child.children.map((item) => ({
      label: item.name,
      href: hrefForCategory(item),
    })),
  }));
}

payload.items.forEach(renderMegaMenuColumns); // items = [women, men, collection]
```

## Contrato de productos por categoría

Para cargar productos de una categoría:

```http
GET /api/storefront/catalog/categories/{path}/products
Accept: application/json
```

Ejemplo:

```http
GET /api/storefront/catalog/categories/women/clothing/tshirts/products
```

Notas:

- `{path}` acepta slashes.
- El backend resuelve el tenant por `Host`.
- El backend incluye productos de la categoría solicitada y de sus descendientes.
- La asignación producto-categoría viene de `category_product`.
- El front no debe enviar `subcategory_id`, `category_section_id` ni `tenant_id`.
