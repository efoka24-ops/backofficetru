/**
 * Service de suggestions de correction pour bugs détectés
 * Analyse les logs et propose des solutions aux problèmes courants
 */

const BUG_PATTERNS = [
  {
    name: 'Image trop volumineuse',
    patterns: [
      /image.*trop.*volumineux/i,
      /file.*too.*large/i,
      /size.*exceed/i,
      /250kb/i
    ],
    solutions: [
      {
        title: '📷 Compresser l\'image',
        description: 'Utilisez un outil en ligne comme TinyPNG ou Compressor.io pour réduire la taille du fichier à moins de 250KB',
        steps: [
          'Ouvrez https://tinypng.com',
          'Téléchargez votre image',
          'Téléchargez l\'image compressée',
          'Essayez à nouveau avec la nouvelle image'
        ],
        priority: 'HIGH'
      },
      {
        title: '⚙️ Augmenter la limite backend',
        description: 'Modifier la limite d\'upload côté backend (server.js)',
        steps: [
          'Ouvrir backend/server.js',
          'Chercher: if (req.body.image.length > 250 * 1024)',
          'Changer 250 par 500 (pour 500KB)',
          'Redéployer le backend'
        ],
        priority: 'MEDIUM'
      },
      {
        title: '🖼️ Utiliser des URLs au lieu de base64',
        description: 'Stocker les URLs d\'images au lieu d\'encodage base64',
        steps: [
          'Modifier handlePhotoUpload pour accepter des URLs',
          'Utiliser un service de stockage (Cloudinary, AWS S3)',
          'Réduire la taille des payloads'
        ],
        priority: 'LOW'
      }
    ]
  },
  {
    name: 'Erreur de connexion backend',
    patterns: [
      /connect.*econnrefused/i,
      /backend.*not.*available/i,
      /cannot.*reach.*backend/i,
      /econnrefused.*5000/i
    ],
    solutions: [
      {
        title: '🔌 Vérifier que le backend est démarré',
        description: 'Le serveur backend doit être en cours d\'exécution',
        steps: [
          'Ouvrir un terminal dans backend/',
          'Lancer: npm start',
          'Vérifier le message: "✅ Server running on port 5000"'
        ],
        priority: 'HIGH'
      },
      {
        title: '🌐 Vérifier l\'URL du backend',
        description: 'Vérifier que la configuration pointe vers le bon backend',
        steps: [
          'En production: https://back.trugroup.cm',
          'En local: http://localhost:5000',
          'Vérifier dans .env ou config/apiConfig.js'
        ],
        priority: 'HIGH'
      },
      {
        title: '🚀 Réveiller le backend Render',
        description: 'Les services gratuits Render s\'endorment après inactivité',
        steps: [
          'Visiter: https://back.trugroup.cm/api/health',
          'Attendre 30-60 secondes pour le démarrage',
          'Essayer à nouveau'
        ],
        priority: 'MEDIUM'
      }
    ]
  },
  {
    name: 'Erreur d\'authentification',
    patterns: [
      /unauthorized/i,
      /authentication.*failed/i,
      /invalid.*token/i,
      /401|403/i
    ],
    solutions: [
      {
        title: '🔐 Se reconnecter',
        description: 'Le token d\'authentification a peut-être expiré',
        steps: [
          'Cliquer sur "Se déconnecter" en haut à droite',
          'Se reconnecter avec vos identifiants',
          'Essayer l\'opération à nouveau'
        ],
        priority: 'HIGH'
      },
      {
        title: '🗑️ Effacer le cache du navigateur',
        description: 'Les données locales peuvent être corrompues',
        steps: [
          'Ouvrir DevTools (F12)',
          'Aller à Application → Local Storage',
          'Supprimer toutes les entrées du domaine',
          'Actualiser la page'
        ],
        priority: 'MEDIUM'
      }
    ]
  },
  {
    name: 'Erreur de validation',
    patterns: [
      /validation.*failed/i,
      /required.*field/i,
      /invalid.*format/i
    ],
    solutions: [
      {
        title: '✅ Vérifier les champs obligatoires',
        description: 'Tous les champs marqués comme obligatoires doivent être remplis',
        steps: [
          'Nom: doit être non vide',
          'Fonction: doit être non vide',
          'Photo: doit être < 250KB',
          'Vérifier qu\'aucun champ n\'est vide'
        ],
        priority: 'HIGH'
      }
    ]
  },
  {
    name: 'Erreur de synchronisation',
    patterns: [
      /sync.*failed/i,
      /synchronization.*error/i,
      /cannot.*sync/i
    ],
    solutions: [
      {
        title: '🔄 Réessayer la synchronisation',
        description: 'Les erreurs de réseau peuvent être temporaires',
        steps: [
          'Cliquer sur "Actualiser" dans la page',
          'Attendre 5 secondes',
          'Essayer à nouveau'
        ],
        priority: 'MEDIUM'
      },
      {
        title: '🌐 Vérifier la connexion Internet',
        description: 'Une mauvaise connexion peut causer des erreurs',
        steps: [
          'Vérifier que vous êtes connecté à Internet',
          'Essayer d\'accéder à un autre site',
          'Redémarrer votre routeur si nécessaire'
        ],
        priority: 'HIGH'
      }
    ]
  },
  {
    name: 'Erreur de chargement des données',
    patterns: [
      /failed.*load/i,
      /cannot.*fetch/i,
      /data.*unavailable/i,
      /load.*error/i
    ],
    solutions: [
      {
        title: '🔄 Actualiser la page',
        description: 'Recharger peut résoudre les problèmes temporaires',
        steps: [
          'Appuyer sur F5 ou Ctrl+R',
          'Attendre le chargement',
          'Si toujours erreur, continuer'
        ],
        priority: 'HIGH'
      },
      {
        title: '🗑️ Vider le cache',
        description: 'Les données en cache peuvent être périmées',
        steps: [
          'DevTools → Application → Cache Storage',
          'Supprimer tous les caches du domaine',
          'Actualiser'
        ],
        priority: 'MEDIUM'
      }
    ]
  }
];

/**
 * Analyser un log et proposer des solutions
 */
export function analyzeBugAndSuggestSolution(log) {
  if (log.level !== 'ERROR' && log.level !== 'WARN') {
    return null;
  }

  const message = (log.message || '').toLowerCase();
  const dataStr = (JSON.stringify(log.data || {})).toLowerCase();
  const fullText = `${message} ${dataStr}`;

  for (const pattern of BUG_PATTERNS) {
    for (const regex of pattern.patterns) {
      if (regex.test(fullText)) {
        return {
          bugType: pattern.name,
          solutions: pattern.solutions,
          matchedPattern: regex.source,
          logId: `${log.timestamp}-${log.message}`
        };
      }
    }
  }

  return null;
}

/**
 * Obtenir la priorité d'une solution
 */
export function getPrioritySortOrder(priority) {
  const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  return order[priority] ?? 3;
}

/**
 * Formatter une solution pour l'affichage
 */
export function formatSolution(solution) {
  return {
    ...solution,
    priorityColor: {
      HIGH: 'bg-red-100 text-red-700 border-red-300',
      MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      LOW: 'bg-blue-100 text-blue-700 border-blue-300'
    }[solution.priority] || 'bg-gray-100'
  };
}

export default {
  analyzeBugAndSuggestSolution,
  getPrioritySortOrder,
  formatSolution
};
