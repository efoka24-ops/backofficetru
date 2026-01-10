import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Upload } from 'lucide-react'

export default function TeamForm({ isOpen, item, onClose, onSave, isSaving }) {
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    bio: '',
    image: ''
  })

  useEffect(() => {
    if (item) {
      setFormData(item)
    } else {
      setFormData({ name: '', position: '', bio: '', image: '' })
    }
  }, [item, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setFormData(prev => ({ ...prev, image: ev.target.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = () => {
    if (!formData.name || !formData.position) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }
    onSave(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {item ? 'Éditer le membre' : 'Ajouter un membre'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nom complet"
            />
          </div>
          <div>
            <Label htmlFor="position">Poste</Label>
            <Input
              id="position"
              name="position"
              value={formData.position}
              onChange={handleChange}
              placeholder="Ex: Développeur"
            />
          </div>
          <div>
            <Label htmlFor="bio">Biographie</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Décrivez le membre..."
              rows="4"
            />
          </div>
          <div>
            <Label htmlFor="image">Photo</Label>
            <div className="flex items-center gap-2">
              {formData.image && (
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg cursor-pointer hover:bg-slate-200 transition">
                <Upload size={16} />
                <span className="text-sm">Télécharger</span>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  hidden
                />
              </label>
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
