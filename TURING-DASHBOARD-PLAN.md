# Plan de d'implementation - Dashboard Meta Ads TURING

## Resume du projet

**Objectif**: Dashboard de visualisation des performances publicitaires Meta Ads pour une marque de complements alimentaires (AG1).

**Duree estimee**: 30-60 minutes

**Criteres d'evaluation**:
- Design (UI/UX): 40 points
- Comprehension metier: 30 points
- Fonctionnel: 30 points

---

## Architecture technique

### Stack existante (boilerplate)
- **Framework**: Next.js 16 avec App Router
- **UI**: Shadcn/UI + TailwindCSS v4
- **Graphiques**: Recharts (deja installe)
- **Etat**: Zustand, nuqs (URL state)
- **Composants disponibles**:
  - `Card`, `CardHeader`, `CardContent` - pour les KPIs
  - `Table`, `TableHeader`, `TableBody`, etc. - pour le tableau
  - `Select`, `SelectContent`, `SelectItem` - pour les filtres
  - `Sidebar`, `SidebarProvider`, etc. - pour la navigation
  - `ChartContainer`, `ChartTooltip` - pour les graphiques Recharts

### Structure des fichiers a creer

```
app/
  dashboard/
    layout.tsx              # Layout avec sidebar
    page.tsx               # Redirection vers overview
    overview/
      page.tsx             # Ecran 1: Overview
    creas/
      page.tsx             # Ecran 2: Tableau des creas
      [id]/
        page.tsx           # Ecran 3: Detail d'une crea
    _components/
      dashboard-sidebar.tsx    # Sidebar navigation
      kpi-card.tsx             # Composant carte KPI
      filters.tsx              # Composants filtres reutilisables
      top-ranking.tsx          # Composant classement top 5

src/
  features/
    dashboard/
      types.ts                 # Types TypeScript pour les donnees
      data-provider.tsx        # Context pour les donnees CSV
      hooks/
        use-dashboard-data.ts  # Hook pour filtrer/calculer les donnees
        use-filters.ts         # Hook pour gerer les filtres
      utils/
        parse-csv.ts           # Parser CSV -> objets JS
        calculations.ts        # Fonctions de calcul KPIs

public/
  data/
    AG1-Data.csv              # Fichier de donnees (a telecharger)
```

---

## Structure des donnees CSV

### Colonnes principales
| Colonne | Type | Utilisation |
|---------|------|-------------|
| Nom de l'annonce | Texte | Identifiant unique |
| Produit | Texte | Filtre, groupement |
| Createur | Texte | Filtre, classement |
| Type de contenu | Texte | Filtre |
| Angle marketing | Texte | Info detail |
| Hook | Texte | Info detail |
| Mois | Texte | Filtre, graphique |
| Statut | Texte | Filtre |
| Budget depense (EUR) | Nombre | KPI principal |
| Conversions (achats) | Nombre | KPI principal |
| Revenu estime (EUR) | Nombre | KPI principal |
| ROAS | Nombre | KPI principal |
| Cout par conversion (EUR) | Nombre | KPI principal |
| Impressions | Nombre | KPI detail |
| Clics | Nombre | KPI detail |
| Taux de clic (%) | Nombre | KPI detail |

### Valeurs reelles extraites du CSV (1268 lignes)

```typescript
const PRODUCTS = [
  "AG1 Powder",
  "AG1 Travel Packs",
  "Abonnement",
  "Bundle Complet",
  "Omega-3",
  "Shaker",
  "Vitamine D3+K2"
];

const CREATORS = [
  "Ava_Balance",
  "Ben_Recovery",
  "Chloe_Clean",
  "Chris_Endurance",
  "Emma_Health",
  "Ethan_Fuel",
  "Jake_Strong",
  "Lily_Nutrition",
  "Lucas_Active",
  "Marcus_Fit",
  "Max_Performance",
  "Mia_Mindful",
  "Noah_Vitality",
  "Olivia_Green",
  "Sophia_Wellness",
  "Zoe_Energy",
  "—" // Pas de createur
];

const CONTENT_TYPES = [
  "Image statique",
  "Motion/Video",
  "Podcast",
  "Temoignage",
  "UGC"
];

const MONTHS = [
  "Juillet 2025",
  "Aout 2025",
  "Septembre 2025",
  "Octobre 2025",
  "Novembre 2025"
];

const STATUSES = [
  "En ligne",
  "Arretee",
  "En pause",
  "Archivee"
];
```

---

## Ecran 1: Overview

### Filtres (en haut)
- Selecteur de produit (multi ou single)
- Selecteur de mois
- Selecteur de statut

### 6 Cartes KPIs (grille 3x2)
1. **Budget depense** - Somme de Budget depense (EUR) - Icone: Wallet
2. **Conversions** - Somme de Conversions (achats) - Icone: ShoppingCart
3. **ROAS moyen** - Moyenne de ROAS - Icone: TrendingUp
4. **Cout par conversion** - Moyenne de Cout par conversion (EUR) - Icone: Target
5. **Revenu total** - Somme de Revenu estime (EUR) - Icone: DollarSign
6. **Nombre de creas** - Nombre de lignes filtrees - Icone: FileImage

### 2 Graphiques cote a cote
- **Gauche**: ROAS par mois (BarChart)
- **Droite**: Budget par produit (PieChart ou BarChart horizontal)

### 2 Classements en bas
- **Gauche**: Top 5 creas par ROAS
- **Droite**: Top 5 createurs par conversions

---

## Ecran 2: Tableau des creas

### Filtres (en haut)
- Produit (Select)
- Createur (Select)
- Type de contenu (Select)
- Mois (Select)
- Statut (Select)
- Recherche (Input texte)

### Colonnes du tableau
| Colonne | Tri | Format |
|---------|-----|--------|
| Nom de l'annonce | Oui | Texte |
| Produit | Oui | Badge/Texte |
| Createur | Oui | Texte |
| Type | Oui | Badge |
| Mois | Oui | Texte |
| Statut | Oui | Badge colore |
| Budget (EUR) | Oui | Nombre formate |
| Conversions | Oui | Nombre |
| ROAS | Oui | Nombre (2 decimales) |
| Cout par conversion (EUR) | Oui | Nombre formate |

### Fonctionnalites
- Clic sur en-tete = tri (asc/desc)
- Filtres en temps reel
- Clic sur ligne = navigation vers detail
- Pagination si necessaire

---

## Ecran 3: Detail d'une crea

### En-tete
- Nom de la crea (titre)
- Produit + Createur (sous-titre)
- Bouton retour

### 8 Cartes KPIs (grille 4x2)
1. Budget
2. Conversions
3. ROAS
4. Cout par conversion
5. Revenu
6. Impressions
7. Clics
8. Taux de clic

### Informations de la crea (Card)
- Type de contenu
- Angle marketing
- Hook
- Mois
- Statut
- Date de lancement (si disponible)

---

## Design Guidelines

### Style visuel
- Fond clair (blanc ou gris tres clair `bg-background` ou `bg-muted`)
- Sidebar a gauche avec navigation
- Cartes KPIs: icone + label + grand chiffre
- Graphiques propres avec legendes
- Tableau avec lignes alternees, hover, tri

### Couleurs des statuts
```typescript
const STATUS_COLORS = {
  "En ligne": "bg-green-100 text-green-800",
  "Arretee": "bg-red-100 text-red-800",
  "En pause": "bg-yellow-100 text-yellow-800",
  "Archivee": "bg-gray-100 text-gray-800"
};
```

### Formatage des nombres
```typescript
// Budget, Revenu, Cout
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

// ROAS
const formatROAS = (value: number) => value.toFixed(2);

// Pourcentage
const formatPercent = (value: number) => `${value.toFixed(2)}%`;

// Grands nombres
const formatNumber = (value: number) =>
  new Intl.NumberFormat('fr-FR').format(value);
```

---

## Ordre d'implementation

### Phase 1: Infrastructure (10 min)
1. Creer la structure des dossiers
2. Configurer le parser CSV
3. Creer les types TypeScript
4. Creer le context/provider pour les donnees

### Phase 2: Layout et Navigation (5 min)
1. Creer le layout dashboard avec sidebar
2. Configurer les routes

### Phase 3: Overview (15 min)
1. Creer les filtres
2. Creer les cartes KPIs
3. Creer les graphiques
4. Creer les classements

### Phase 4: Tableau (10 min)
1. Creer les filtres
2. Creer le tableau avec tri
3. Ajouter la navigation vers detail

### Phase 5: Detail (10 min)
1. Creer la page detail
2. Afficher les KPIs
3. Afficher les informations

### Phase 6: Polish (10 min)
1. Ajustements UI
2. Tests manuels
3. Corrections

---

## Statut

**CSV charge avec succes** : `public/data/AG1-Data.csv`
- 1268 lignes de donnees
- 30 colonnes
- 7 produits, 17 createurs, 5 types de contenu, 5 mois, 4 statuts

Pret pour l'implementation !

---

## Notes techniques

### Chargement des donnees
Le CSV sera charge cote client via fetch pour permettre les filtres dynamiques sans recharger la page.

### Gestion d'etat
- Filtres: `nuqs` pour synchroniser avec l'URL
- Donnees: Context React pour partager entre composants
- Calculs: `useMemo` pour optimiser les recalculs

### Performance
- Virtualisation du tableau si > 500 lignes visibles
- Debounce sur la recherche texte
- Memoization des calculs KPIs
