import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { useSyncStatus } from '@/hooks/useSyncStatus';

export default function SyncStatus() {
  const syncStatus = useSyncStatus();

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'checking':
        return <Wifi className="w-5 h-5 text-yellow-600 animate-pulse" />;
      case 'offline':
        return <WifiOff className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'connected':
        return 'Connecté';
      case 'checking':
        return 'Vérification...';
      case 'offline':
        return 'Hors ligne';
      default:
        return 'Erreur';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'bg-green-50 border-green-200';
      case 'checking':
        return 'bg-yellow-50 border-yellow-200';
      case 'offline':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-orange-50 border-orange-200';
    }
  };

  const services = [
    { name: 'Backend Principal', status: syncStatus.backend, port: '5000' },
    { name: 'Frontend Admin', status: syncStatus.frontend, port: '5173' },
    { name: 'Site TRU', status: syncStatus.truSite, port: '3000' }
  ];

  const allConnected = services.every(s => s.status === 'connected');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg border p-6 ${allConnected ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}
    >
      <h3 className={`font-semibold mb-4 flex items-center gap-2 ${allConnected ? 'text-green-900' : 'text-amber-900'}`}>
        <Wifi className="w-5 h-5" />
        État de la synchronisation
      </h3>

      <div className="space-y-3">
        {services.map((service) => (
          <div key={service.name} className={`flex items-center justify-between p-3 rounded-lg ${getStatusColor(service.status)}`}>
            <div className="flex items-center gap-3">
              {getStatusIcon(service.status)}
              <div>
                <p className="font-medium text-slate-900">{service.name}</p>
                <p className="text-sm text-slate-600">Port: {service.port}</p>
              </div>
            </div>
            <span className="text-sm font-semibold text-slate-600">{getStatusLabel(service.status)}</span>
          </div>
        ))}
      </div>

      {syncStatus.errors.length > 0 && (
        <div className="mt-4 pt-4 border-t border-amber-200">
          <p className="text-sm font-semibold text-amber-900 mb-2">Erreurs détectées:</p>
          <ul className="space-y-1">
            {syncStatus.errors.map((error, idx) => (
              <li key={idx} className="text-sm text-amber-800">• {error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 text-xs text-slate-600">
        Dernière vérification: {syncStatus.lastSync?.toLocaleTimeString('fr-FR')}
      </div>
    </motion.div>
  );
}
