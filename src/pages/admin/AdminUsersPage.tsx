import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Shield, User, Trash2, Search, Crown } from 'lucide-react'
import { Button, Input, Card, Badge, Modal, Spinner, EmptyState } from '@/components/ui'
import { adminApi } from '@/api/admin.api'
import { useAuthStore } from '@/store/authStore'
import { formatDate, getErrorMessage, getRoleLabel } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { UserRole } from '@/types'

export default function AdminUsersPage() {
  const queryClient = useQueryClient()
  const { user: currentUser } = useAuthStore()
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)

  const { data: users, isLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: adminApi.getUsers,
  })

  const { mutate: updateRole } = useMutation({
    mutationFn: ({ id, role }: { id: number; role: UserRole }) =>
      adminApi.changeUserRole(id, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      toast.success('Роль пользователя обновлена')
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, 'Нет прав или не удалось обновить роль'))
    },
  })

  const { mutate: deleteUser, isPending: deleting } = useMutation({
    mutationFn: (id: number) => adminApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      toast.success('Пользователь удален')
      setDeleteTarget(null)
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, 'Нет прав или не удалось удалить пользователя'))
    },
  })

  const filtered = useMemo(() => {
    if (!users) return []
    if (!search) return users
    const q = search.toLowerCase()
    return users.filter(u =>
      u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    )
  }, [users, search])

  const isSuperuser = currentUser?.role === 'superuser'

  const getNextRole = (currentRole: string): UserRole =>
    currentRole === 'admin' ? 'user' : 'admin'

  const roleVariant = (role: string) =>
    role === 'superuser' ? 'destructive' : role === 'admin' ? 'default' : 'secondary'

  const getRoleIcon = (role: string) => {
    if (role === 'superuser') return <Crown className="w-3 h-3" />
    if (role === 'admin') return <Shield className="w-3 h-3" />
    return <User className="w-3 h-3" />
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-6 animate-fade-in-up">
        <h1 className="text-2xl font-bold tracking-tight text-(--foreground)">
          Управление пользователями
        </h1>
        <p className="text-sm mt-1 text-(--muted-foreground)">
          {users?.length ?? 0} пользователей зарегистрировано
        </p>
      </div>

      {/* Search */}
      <div className="mb-5 animate-fade-in-up" style={{ animationDelay: '50ms' }}>
        <Input
          placeholder="Поиск по имени или email..."
          leftIcon={<Search className="w-4 h-4" />}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner className="w-8 h-8" /></div>
      ) : !filtered.length ? (
        <EmptyState
          icon={<User className="w-12 h-12" />}
          title="Пользователи не найдены"
          description={search ? `По запросу "${search}" ничего не найдено.` : 'Пока нет пользователей.'}
        />
      ) : (
        <Card className="overflow-hidden animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-(--border) bg-(--muted)/50">
                  {['Пользователь', 'Дата регистрации', 'Роль', ''].map((h, i) => (
                    <th
                      key={i}
                      className={`px-4 py-3 text-xs font-semibold text-(--muted-foreground) uppercase tracking-wider ${h === '' ? 'text-right' : ''} ${h === 'Дата регистрации' ? 'hidden sm:table-cell' : ''}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-(--border)">
                {filtered.map(u => (
                  <tr key={u.id} className="group hover:bg-(--muted)/30 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        {u.avatar ? (
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover shrink-0 border border-(--border)"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-(--secondary) border border-(--border) flex items-center justify-center shrink-0 text-xs font-semibold text-(--foreground)">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-(--foreground) truncate">
                            {u.name}
                            {u.id === currentUser?.id && (
                              <span className="ml-1.5 text-[10px] text-(--muted-foreground)">(вы)</span>
                            )}
                          </p>
                          <p className="text-xs text-(--muted-foreground) truncate mt-0.5">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell text-xs text-(--muted-foreground)">
                      {formatDate(u.created_at)}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={roleVariant(u.role) as any}>
                        {getRoleIcon(u.role)}
                        {getRoleLabel(u.role)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {u.id !== currentUser?.id && (
                        <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          {isSuperuser && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => updateRole({ id: u.id, role: getNextRole(u.role) })}
                            >
                              {u.role === 'admin' ? 'Сделать пользователем' : 'Сделать админом'}
                            </Button>
                          )}
                          {(isSuperuser || (currentUser?.role === 'admin' && u.role === 'user')) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                              onClick={() => setDeleteTarget(u.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Delete Modal */}
      <Modal
        open={deleteTarget !== null}
        onClose={() => !deleting && setDeleteTarget(null)}
        title="Удалить пользователя"
        description="Вы уверены, что хотите удалить этого пользователя? Это действие необратимо."
      >
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
            Отмена
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteTarget && deleteUser(deleteTarget)}
            loading={deleting}
          >
            Удалить
          </Button>
        </div>
      </Modal>
    </div>
  )
}
