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
      toast.success('Foydalanuvchi roli yangilandi')
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, 'Ruxsat yo\'q yoki rolni yangilab bo\'lmadi'))
    },
  })

  const { mutate: deleteUser, isPending: deleting } = useMutation({
    mutationFn: (id: number) => adminApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      toast.success("Foydalanuvchi o'chirildi")
      setDeleteTarget(null)
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Ruxsat yo'q yoki foydalanuvchini o'chirib bo'lmadi"))
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
        return { background: 'rgba(239,68,68,0.10)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.20)' }
      case 'admin':
        return { background: 'rgba(168,85,247,0.10)', color: '#a855f7', borderColor: 'rgba(168,85,247,0.20)' }
      default:
        return { background: 'rgba(59,130,246,0.10)', color: '#3b82f6', borderColor: 'rgba(59,130,246,0.20)' }
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superuser': return <Crown className="w-3 h-3" />
      case 'admin': return <Shield className="w-3 h-3" />
      default: return <User className="w-3 h-3" />
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-in-up">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
            Foydalanuvchilarni boshqarish
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            {formatCount(users?.length ?? 0, "ro'yxatdan o'tgan foydalanuvchi")}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 animate-fade-in-up animate-delay-100">
        <Input
          placeholder="Ism yoki email bo'yicha qidirish..."
          leftIcon={<Search className="w-4 h-4" />}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner className="w-8 h-8" /></div>
      ) : !filtered.length ? (
        <EmptyState
          icon={<User className="w-14 h-14" />}
          title="Foydalanuvchi topilmadi"
          description={search ? `"${search}" bo'yicha natija yo'q` : "Hozircha foydalanuvchi yo'q"}
        />
      ) : (
        <Card className="overflow-hidden animate-fade-in-up animate-delay-200">
          <table className="w-full evote-table">
            <thead>
              <tr>
                {['Foydalanuvchi', 'Qo\'shilgan', 'Rol', ''].map(h => (
                  <th
                    key={h}
                    className={`text-left ${h === '' ? 'text-right' : ''} ${h === 'Qo\'shilgan' ? 'hidden sm:table-cell' : ''}`}
                    style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} style={{ background: 'var(--card)' }}>
                  <td>
                    <div className="flex items-center gap-3">
                      {u.avatar ? (
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                          style={{ background: 'var(--primary)/12', color: 'var(--primary)' }}
                        >
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>
                          {u.name}
                          {u.id === currentUser?.id && (
                            <span className="ml-1.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>(siz)</span>
                          )}
                        </p>
                        <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
                          {u.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell">
                    <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      {formatDate(u.created_at)}
                    </span>
                  </td>
                  <td>
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border"
                      style={getRoleBadgeStyle(u.role)}
                    >
                      {getRoleIcon(u.role)}
                      {getRoleLabel(u.role)}
                    </span>
                  </td>
                  <td>
                    {u.id !== currentUser?.id && (
                      <div className="flex items-center justify-end gap-1.5">
                        {isSuperuser && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateRole({ id: u.id, role: getNextRole(u.role) })}
                            className="text-xs"
                          >
                            {u.role === 'admin' ? 'Oddiy foydalanuvchi qilish' : 'Admin qilish'}
                          </Button>
                        )}
                        {(isSuperuser || (currentUser?.role === 'admin' && u.role === 'user')) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            style={{ color: 'var(--destructive)' }}
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
        </Card>
      )}

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Foydalanuvchini o'chirish"
        description="Bu amalni qaytarib bo'lmaydi."
        size="sm"
      >
        <p className="text-sm mb-5" style={{ color: 'var(--muted-foreground)' }}>
          Foydalanuvchi darhol kirish huquqini yo'qotadi. Uning ovozlari tizimda qoladi.
        </p>
        <div className="flex gap-2.5">
          <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>Bekor qilish</Button>
          <Button
            variant="destructive"
            className="flex-1"
            loading={deleting}
            onClick={() => deleteTarget && deleteUser(deleteTarget)}
          >
            Foydalanuvchini o'chirish
          </Button>
        </div>
      </Modal>
    </div>
  )
}
