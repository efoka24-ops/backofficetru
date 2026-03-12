import React from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ServiceRow from './ServiceRow'

export default function ServicesList({ services, isLoading, onEdit, onDelete }) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-slate-500">Chargement...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Services</CardTitle>
        <Button onClick={() => onEdit(null)} className="gap-2">
          <Plus size={18} />
          Nouveau service
        </Button>
      </CardHeader>
      <CardContent>
        {services.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            Aucun service. Créez-en un pour commencer.
          </div>
        ) : (
          <div className="space-y-2">
            {services.map(service => (
              <ServiceRow
                key={service.id}
                service={service}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
