import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Shield, User, Trash2, Search, Crown } from 'lucide-react'
import { Button, Input, Card, Modal, Spinner, EmptyState } from '@/components/ui'
import { adminApi } from '@/api/admin.api'
import { useAuthStore } from '@/store/authStore'
import { formatCount, formatDate, getErrorMessage, getRoleLabel } from '@/lib/utils'
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
      toast.success("Пользователь удален")
      setDeleteTarget(null)
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Нет прав или не удалось удалить пользователя"))
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

  const getNextRole = (currentRole: string): UserRole => {
    if (currentRole === 'admin') return 'user'
    return 'admin'
  }

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'superuser':
        return { background: 'rgba(239,68,68,0.15)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.30)' }
      case 'admin':
        return { background: 'rgba(168,85,247,0.15)', color: '#a855f7', borderColor: 'rgba(168,85,247,0.30)' }
      default:
        return { background: 'rgba(59,130,246,0.15)', color: '#3b82f6', borderColor: 'rgba(59,130,246,0.30)' }
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superuser': return <Crown className="w-3.5 h-3.5" />
      case 'admin': return <Shield className="w-3.5 h-3.5" />
      default: return <User className="w-3.5 h-3.5" />
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-8 animate-fade-in-up relative z-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            Управление пользователями
          </h1>
          <p className="text-base mt-1 text-muted-foreground">
            {formatCount(users?.length ?? 0, "пользователь(ей) зарегистрировано")}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 animate-fade-in-up relative z-10" style={{ animationDelay: '50ms' }}>
        <Input
          placeholder="Поиск по имени или email..."
          leftIcon={<Search className="w-4 h-4 text-muted-foreground" />}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-md h-11 bg-card/60 backdrop-blur-sm border-border/50 focus:ring-primary/20 transition-all font-medium"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20 relative z-10"><Spinner className="w-10 h-10 text-primary" /></div>
      ) : !filtered.length ? (
        <EmptyState
          icon={<User className="w-16 h-16 text-muted-foreground/50" />}
          title="Пользователи не найдены"
          description={search ? `По запросу "${search}" ничего не найдено.` : "Пока нет пользователей."}
          className="relative z-10"
        />
      ) : (
        <Card className="overflow-hidden animate-fade-in-up border-border/40 backdrop-blur-xl bg-card/40 shadow-xl relative z-10" style={{ animationDelay: '100ms' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  {['Пользователь', 'Дата регистрации', 'Роль', ''].map((h, i) => (
                    <th
                      key={i}
                      className={`px-6 py-4 font-semibold text-muted-foreground uppercase tracking-wider text-[11px] ${h === '' ? 'text-right' : ''} ${h === 'Дата регистрации' ? 'hidden sm:table-cell' : ''}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.map((u, index) => (
                  <tr 
                    key={u.id} 
                    className="group bg-transparent hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {u.avatar ? (
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-10 h-10 rounded-full object-cover shrink-0 shadow-sm border border-border/50"
                          />
                        ) : (
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold shadow-sm"
                            style={{ background: 'var(--primary)/15', color: 'var(--primary)' }}
                          >
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-bold truncate text-foreground group-hover:text-primary transition-colors">
                            {u.name}
                            {u.id === currentUser?.id && (
                              <span className="ml-2 text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">(вы)</span>
                            )}
                          </p>
                          <p className="text-xs truncate text-muted-foreground mt-0.5">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell align-middle text-muted-foreground font-medium">
                      {formatDate(u.created_at)}
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border shadow-sm backdrop-blur-sm"
                        style={getRoleBadgeStyle(u.role)}
                      >
                        {getRoleIcon(u.role)}
                        {getRoleLabel(u.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right align-middle">
                      {u.id !== currentUser?.id && (
                        <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          {isSuperuser && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateRole({ id: u.id, role: getNextRole(u.role) })}
                              className="text-xs h-8 backdrop-blur-md"
                            >
                              {u.role === 'admin' ? 'Сделать пользователем' : 'Сделать админом'}
                            </Button>
                          )}
                          {(isSuperuser || (currentUser?.role === 'admin' && u.role === 'user')) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => setDeleteTarget(u.id)}
                            >
                              <Trash2 className="w-4 h-4" />
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
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
            Отмена
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteTarget && deleteUser(deleteTarget)}
            loading={deleting}
            className="shadow-md"
          >
            Удалить
          </Button>
        </div>
      </Modal>
    </div>
  )
}
