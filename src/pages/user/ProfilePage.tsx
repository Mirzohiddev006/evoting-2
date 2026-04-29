import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Mail, Calendar, CheckCircle2, Vote, Camera, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Skeleton, Button, Input } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import { usersApi } from '@/api/users.api'
import { formatDate, getErrorMessage, getRoleLabel } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(user?.name ?? '')
  const [editEmail, setEditEmail] = useState(user?.email ?? '')

  // Profil ma'lumotlarini API'dan yangilab olamiz.
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => usersApi.getMe(),
    enabled: !!user,
  })

  const displayUser = profile ?? user

  const { mutate: saveProfile, isPending: saving } = useMutation({
    mutationFn: () => usersApi.updateMe({ name: editName, email: editEmail }),
    onSuccess: (updated) => {
      updateUser(updated)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      setEditing(false)
      toast.success('Profil yangilandi!')
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, 'Profilni yangilab bo\'lmadi'))
    },
  })

  const { mutate: uploadAvatar, isPending: uploading } = useMutation({
    mutationFn: (file: File) => usersApi.uploadAvatar(file),
    onSuccess: (updated) => {
      updateUser(updated)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Avatar yuklandi!')
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, 'Avatarni yuklab bo\'lmadi'))
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadAvatar(file)
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'superuser':
        return { label: 'Superadmin', style: { background: 'rgba(239,68,68,0.10)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.20)' } }
      case 'admin':
        return { label: 'Admin', style: { background: 'rgba(168,85,247,0.10)', color: '#a855f7', borderColor: 'rgba(168,85,247,0.20)' } }
      default:
        return { label: 'A\'zo', style: { background: 'rgba(59,130,246,0.10)', color: '#3b82f6', borderColor: 'rgba(59,130,246,0.20)' } }
    }
  }

  const badge = getRoleBadge(displayUser?.role ?? 'user')

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1
        className="text-xl font-bold mb-6 animate-fade-in-up"
        style={{ color: 'var(--foreground)' }}
      >
        Mening profilim
      </h1>

      {profileLoading ? (
        <Card className="mb-5">
          <CardContent className="p-6">
            <div className="flex items-start gap-5">
              <Skeleton className="w-14 h-14 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-60" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-5 animate-fade-in-up">
          <CardContent className="p-6">
            <div className="flex items-start gap-5">
              {/* Avatar */}
              <div className="relative group">
                {displayUser?.avatar ? (
                  <img
                    src={displayUser.avatar}
                    alt={displayUser.name}
                    className="w-14 h-14 rounded-2xl object-cover"
                  />
                ) : (
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-2xl font-bold"
                    style={{ background: 'var(--primary)/12', color: 'var(--primary)' }}
                  >
                    {displayUser?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute inset-0 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(0,0,0,0.5)' }}
                >
                  <Camera className="w-5 h-5 text-white" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              <div className="flex-1 min-w-0">
                {editing ? (
                  <div className="space-y-3">
                    <Input
                      label="Ism"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                    />
                    <Input
                      label="Email"
                      type="email"
                      value={editEmail}
                      onChange={e => setEditEmail(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" loading={saving} onClick={() => saveProfile()} className="gap-1.5">
                        <Save className="w-3.5 h-3.5" />
                        Saqlash
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                        Bekor qilish
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
                      {displayUser?.name}
                    </h2>

                    <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-2">
                      <span
                        className="flex items-center gap-1.5 text-sm"
                        style={{ color: 'var(--muted-foreground)' }}
                      >
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        {displayUser?.email}
                      </span>
                      <span
                        className="flex items-center gap-1.5 text-sm"
                        style={{ color: 'var(--muted-foreground)' }}
                      >
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        Qo'shilgan sana: {displayUser?.created_at ? formatDate(displayUser.created_at) : '-'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border"
                        style={badge.style}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3"
                      onClick={() => {
                        setEditName(displayUser?.name ?? '')
                        setEditEmail(displayUser?.email ?? '')
                        setEditing(true)
                      }}
                    >
                      Profilni tahrirlash
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info card */}
      <Card className="animate-fade-in-up animate-delay-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Vote className="w-4.5 h-4.5" style={{ color: 'var(--primary)' }} />
            Hisob ma'lumotlari
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div
            className="py-8 flex flex-col items-center gap-3 text-center rounded-xl"
            style={{ background: 'var(--surface)' }}
          >
            <CheckCircle2 className="w-9 h-9" style={{ color: '#10b981' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
              Hisobingiz faol
            </p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              Rol: {getRoleLabel(displayUser?.role ?? 'user')} | ID: {displayUser?.id}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
