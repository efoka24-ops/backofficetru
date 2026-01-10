import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { teamAPI } from '@/services/api'

export function useTeam() {
  return useQuery({
    queryKey: ['teamMembers'],
    queryFn: () => teamAPI.list('id').then(res => res.data)
  })
}

export function useTeamMutations() {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (data) => teamAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] })
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => teamAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => teamAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] })
    }
  })

  return { createMutation, updateMutation, deleteMutation }
}
