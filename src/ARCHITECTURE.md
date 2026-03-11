# Back Office Structure

## Architecture refactorisée avec séparation des responsabilités

### Arborescence

```
backoffice/src/
├── pages/
│   └── Admin.jsx                    # Page principale (propre et organisée)
├── hooks/                           # Hooks réutilisables
│   ├── useServices.js              # Hooks pour la gestion des services
│   ├── useTeam.js                  # Hooks pour la gestion de l'équipe
│   └── index.js                    # Export centralisé
├── features/                        # Fonctionnalités métier
│   ├── services/
│   │   ├── ServicesList.jsx        # Liste des services
│   │   ├── ServiceRow.jsx          # Ligne d'un service
│   │   ├── ServiceForm.jsx         # Formulaire de création/édition
│   │   └── index.js                # Exports
│   └── team/
│       ├── TeamList.jsx            # Liste de l'équipe
│       ├── TeamRow.jsx             # Ligne d'un membre
│       ├── TeamForm.jsx            # Formulaire de création/édition
│       └── index.js                # Exports
├── components/
│   └── DeleteDialog.jsx            # Dialogue de confirmation de suppression
├── services/
│   └── api.js                      # Client API (axios)
└── ...
```

## Principes de conception

### 1. **Séparation des responsabilités**
- `hooks/` - Logique métier (données, mutations)
- `features/` - Composants métier (UI spécifique à une fonctionnalité)
- `components/` - Composants génériques réutilisables
- `pages/` - Pages composées

### 2. **Composants petits et focalisés**
- `ServicesList` - Gère l'affichage de la liste et les actions
- `ServiceRow` - Gère l'affichage d'une ligne
- `ServiceForm` - Gère le formulaire d'édition
- `DeleteDialog` - Gère la confirmation de suppression

### 3. **Hooks réutilisables**
- `useServices()` - Query pour récupérer les services
- `useServiceMutations()` - Mutations pour créer/modifier/supprimer
- `useTeam()` - Query pour récupérer l'équipe
- `useTeamMutations()` - Mutations pour créer/modifier/supprimer

### 4. **Page Admin simplifiée**
- Gère le state global (activeTab, editingItem, deleteItem)
- Coordonne les hooks et les composants
- Délègue la rendering à des composants focalisés

## Avantages

✅ **Maintenabilité** - Chaque fichier a une responsabilité unique
✅ **Testabilité** - Les composants et hooks sont faciles à tester
✅ **Réutilisabilité** - Les hooks et composants peuvent être réutilisés
✅ **Scalabilité** - Facile d'ajouter de nouvelles fonctionnalités
✅ **Lisibilité** - Code plus clair et moins monolithique

## Exemple d'utilisation

### Importer les hooks
```javascript
import { useServices, useServiceMutations } from '@/hooks'
```

### Importer les composants
```javascript
import { ServicesList, ServiceForm } from '@/features/services'
import { TeamList, TeamForm } from '@/features/team'
```

### Utiliser dans une page
```javascript
const { data: services } = useServices()
const { createMutation, updateMutation, deleteMutation } = useServiceMutations()

// Utiliser les mutations
createMutation.mutate(newService)
```

## Prochaines étapes

Pour ajouter une nouvelle fonctionnalité (ex: "Contenu"):
1. Créer `features/content/` avec ContentsList, ContentRow, ContentForm
2. Créer `hooks/useContent.js` avec les queries/mutations
3. Importer dans Admin.jsx et ajouter l'onglet

