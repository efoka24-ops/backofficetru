# Guide de Configuration - Synchronisation en Temps Réel

## Vue d'ensemble

Ce guide explique comment mettre en place la synchronisation en temps réel entre le backoffice et le frontend. Cette solution garantit que :

1. ✅ Les modifications du backoffice sont immédiatement visibles sur le frontend
2. ✅ Les données existantes ne sont jamais perdues ou écrasées
3. ✅ Les champs sensibles sont préservés lors des mises à jour
4. ✅ Un système de queue gère les mises à jour asynchrones

## Architecture

```
┌─────────────────┐
│   Backoffice    │
│   (Modifie)     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  RealtimeSyncService                    │
│  - Fusion intelligente des données      │
│  - Préservation des champs              │
│  - Détection des changements            │
│  - Notification du frontend             │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│   Backend API   │
│  (Base de données)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Frontend      │
│   (Affiche)     │
└─────────────────┘
```

## Installation

### 1. Importer les services

Dans vos composants, importez le hook de synchronisation :

```jsx
import { useRealtimeSync } from '../hooks/useRealtimeSync';
```

### 2. Utiliser le hook dans vos composants

Exemple dans une page de paramètres :

```jsx
import { useRealtimeSync } from '../hooks/useRealtimeSync';

export function SettingsPage() {
  const { syncSettings, syncing, syncError } = useRealtimeSync();
  const [settings, setSettings] = useState({});

  const handleSave = async () => {
    try {
      await syncSettings(settings);
      // Les données sont maintenant synchronisées
      // Le frontend sera notifié automatiquement
    } catch (error) {
      console.error('Erreur de synchronisation:', error);
    }
  };

  return (
    <div>
      {syncing && <p>Synchronisation en cours...</p>}
      {syncError && <p className="text-red-500">{syncError}</p>}
      
      <button onClick={handleSave} disabled={syncing}>
        Sauvegarder les paramètres
      </button>
    </div>
  );
}
```

### 3. Ajouter le composant RealtimeSyncIndicator

Dans votre layout principal (App.jsx ou AdminLayout.jsx) :

```jsx
import RealtimeSyncIndicator from './components/RealtimeSyncIndicator';

export function App() {
  return (
    <div>
      {/* Votre contenu */}
      <RealtimeSyncIndicator />
    </div>
  );
}
```

## Configuration des Champs à Préserver

Pour chaque endpoint, vous pouvez spécifier les champs qui doivent être préservés lors des mises à jour :

### Settings
```javascript
await syncSettings(newSettings);
// Préserve: createdAt, updatedBy
```

### Team
```javascript
const { syncTeam } = useRealtimeSync();
await syncTeam(teamMembers);
// Préserve: createdAt, joinDate
```

### Services
```javascript
const { syncServices } = useRealtimeSync();
await syncServices(services);
// Préserve: createdAt, views, rating
```

### Solutions
```javascript
const { syncSolutions } = useRealtimeSync();
await syncSolutions(solutions);
// Préserve: createdAt, views, category
```

## Synchronisation Personnalisée

Pour des cas plus complexes, utilisez la méthode générique `sync()` :

```javascript
const { sync } = useRealtimeSync();

await sync(
  '/api/custom-endpoint',
  'PUT',
  { data: 'value' },
  {
    preserveFields: ['field1', 'field2'],     // Champs à préserver
    onlyUpdateIfChanged: true,                 // Ne mettre à jour que si changements
    notifyFrontend: true                       // Notifier le frontend
  }
);
```

## Flux de Synchronisation Détaillé

### 1. Modification dans le backoffice
L'utilisateur modifie les paramètres et clique sur "Sauvegarder"

### 2. Préparation des données
RealtimeSyncService :
- Récupère les données actuelles du backend
- Compare avec les nouvelles données
- Fusionne intelligemment en préservant les champs spécifiés

### 3. Mise à jour du backend
Les données fusionnées sont envoyées à l'API backend

### 4. Notification du frontend
Le frontend est notifié via :
- **Webhook** (si configuré dans .env)
- **CustomEvent** (pour applications sur la même origine)

### 5. Rafraîchissement du frontend
Le frontend détecte la mise à jour et rafraîchit les données

## Variables d'Environnement

Ajoutez ces variables à votre `.env` :

```env
VITE_BACKEND_URL=https://tru-backend-o1zc.onrender.com
VITE_FRONTEND_URL=https://trugroup.vercel.app
VITE_WEBHOOK_URL=https://votre-webhook-endpoint
```

## Gestion des Erreurs

Le service inclut une gestion automatique des erreurs :

```jsx
const { sync, syncError, clearError } = useRealtimeSync();

// Les erreurs sont automatiquement capturées
if (syncError) {
  console.error('Erreur de sync:', syncError);
  clearError(); // Effacer l'erreur après l'avoir affichée
}
```

## Queue de Synchronisation

Pour les mises à jour rapides, utilisez la queue :

```javascript
const { sync } = useRealtimeSync();

// Ces opérations seront mises en queue et traitées séquentiellement
realtimeSyncService.queueSync('/api/settings', 'PUT', settings1);
realtimeSyncService.queueSync('/api/team', 'PUT', team1);
realtimeSyncService.queueSync('/api/services', 'PUT', services1);
```

## Cas d'Usage

### Mise à jour des paramètres
```javascript
const { syncSettings } = useRealtimeSync();

const settings = {
  companyName: 'TRU Group',
  email: 'contact@tru.com',
  phone: '+33 1 23 45 67 89'
};

await syncSettings(settings);
// Les données existantes (createdAt, updatedBy) sont préservées
```

### Mise à jour de l'équipe
```javascript
const { syncTeam } = useRealtimeSync();

const teamMembers = [
  { id: 1, name: 'Alice', email: 'alice@tru.com', role: 'Manager' },
  { id: 2, name: 'Bob', email: 'bob@tru.com', role: 'Developer' }
];

await syncTeam(teamMembers);
// createdAt et joinDate de chaque membre sont préservés
```

### Ajout de nouveaux services
```javascript
const { syncServices } = useRealtimeSync();

const newServices = [
  ...existingServices,
  { name: 'Nouveau service', description: '...' }
];

await syncServices(newServices);
// Les anciens services et leurs views/ratings sont préservés
```

## Dépannage

### Les modifications n'apparaissent pas sur le frontend

1. Vérifiez que `notifyFrontend: true` dans les options de sync
2. Vérifiez que le frontend écoute l'événement `backoffice-update`
3. Vérifiez la console backend pour les erreurs d'API

### Les données sont écrasées

1. Vérifiez les `preserveFields` configurés
2. Vérifiez que les données fusionnées sont correctes
3. Utilisez `onlyUpdateIfChanged: true` pour les mises à jour conditionnelles

### Les mises à jour rapides causent des conflits

1. Utilisez la queue de synchronisation: `queueSync()`
2. Augmentez le délai entre les mises à jour
3. Groupez les mises à jour en une seule opération

## Performance

- **Fusion intelligente**: Ne met à jour que les champs modifiés
- **Détection de changements**: Évite les mises à jour inutiles
- **Queue asynchrone**: Traite les opérations séquentiellement
- **Logging**: Enregistre toutes les opérations pour le débogage

## Sécurité

- ✅ Utilise des tokens d'authentification
- ✅ Valide les données avant de fusionner
- ✅ Préserve les champs sensibles
- ✅ Enregistre les changements avec timestamps

## Support

Pour toute question, consultez:
- [realtimeSyncService.js](./src/services/realtimeSyncService.js) - Logique principale
- [useRealtimeSync.js](./src/hooks/useRealtimeSync.js) - Hook React
- [RealtimeSyncIndicator.jsx](./src/components/RealtimeSyncIndicator.jsx) - Composant UI
