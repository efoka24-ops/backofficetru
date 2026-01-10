import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { servicesAPI } from '@/services/api'

export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: () => servicesAPI.list('id').then(res => res.data)
  })
}

export function useServiceMutations() {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (data) => servicesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => servicesAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => servicesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
    }
  })

  return { createMutation, updateMutation, deleteMutation }
}
