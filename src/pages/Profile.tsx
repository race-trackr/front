import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import UserProfileForm from '@/components/UserProfileForm'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { Gem, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useMutation } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'
import { toast } from 'sonner'

const Profile: React.FC = () => {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const deleteAccountMutation = useMutation({
    mutationFn: () => apiClient.delete('/users/me'),
    onSuccess: () => {
      logout()
    },
    onError: () => {
      toast.error(t('an_unexpected_error_occurred'))
    },
  })

  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.email || t('guest')
  const avatarFallback = user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'
  const isFreeTier = user?.subscription?.plan === 'free' || !user?.subscription

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-6">{t('my_account')}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{t('profile_information')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.avatar || '/placeholder-user.jpg'} alt={displayName} />
              <AvatarFallback className="text-3xl">{avatarFallback}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xl font-semibold">{displayName}</p>
              <p className="text-muted-foreground">{user?.email || 'guest@example.com'}</p>
              {user?.role ? (
                <Badge variant="secondary" className="mt-1 capitalize">
                  {t('role')}: {t(user.role)}
                </Badge>
              ) : (
                <p className="text-sm text-muted-foreground capitalize">
                  {t('role')}: {t('not_specified')}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription infos */}
      {/* <Card>
        <CardHeader>
          <CardTitle>{t('subscription')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {user?.subscription ? (
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('current_plan')}</p>
              <p className="text-lg font-semibold capitalize">{t(`plan_${user.subscription.plan}_name`)}</p>
              <p className="text-sm text-muted-foreground">
                {t('status')}: <span className="capitalize">{user.subscription.status}</span>
              </p>
              {user.subscription.endDate && (
                <p className="text-sm text-muted-foreground">
                  {t('ends_on')}: {new Date(user.subscription.endDate).toLocaleDateString()}
                </p>
              )}
              <Button asChild className="mt-4 btn-primary-gradient">
                <Link to="/upgrade">
                  <Gem className="mr-2 h-4 w-4" /> {t('manage_subscription')}
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-start space-y-2">
              <p className="text-muted-foreground">{t('no_active_subscription')}</p>
              <p className="text-sm text-muted-foreground">{t('free_tier_active')}</p>
              <Button asChild className="mt-4 btn-primary-gradient">
                <Link to="/upgrade">
                  <Gem className="mr-2 h-4 w-4" /> {t('upgrade_to_pro')}
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card> */}

      <UserProfileForm />

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">{t('danger_zone')}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="font-medium">{t('delete_account')}</p>
            <p className="text-sm text-muted-foreground">{t('delete_account_description')}</p>
          </div>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={deleteAccountMutation.isPending}
            role="button"
            type="button"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t('delete_account')}
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('delete_account_confirm_title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('delete_account_confirm_description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteAccountMutation.isPending}>
              {t('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteAccountMutation.isPending}
              onClick={() => deleteAccountMutation.mutate()}
            >
              {deleteAccountMutation.isPending ? t('deleting') : t('delete_account')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default Profile
