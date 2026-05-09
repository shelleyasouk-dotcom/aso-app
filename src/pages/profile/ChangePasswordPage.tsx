import { useState } from 'react'
import { KeyRound, CheckCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { useAuth } from '../../contexts/AuthContext'

export function ChangePasswordPage() {
  const { profile } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setSaving(true)

    // Re-authenticate first to verify current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: profile!.email,
      password: currentPassword,
    })

    if (signInError) {
      setError('Current password is incorrect')
      setSaving(false)
      return
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }

    setSaving(false)
  }

  return (
    <Layout title="Change Password" showBack>
      <div className="px-4 pt-6 flex flex-col gap-4">
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 flex items-center gap-3">
            <CheckCircle className="text-green-500 shrink-0" size={20} />
            <p className="text-green-800 font-medium">Password changed successfully!</p>
          </div>
        )}

        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#1a3a6b] rounded-xl flex items-center justify-center">
              <KeyRound size={18} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-[#1a3a6b]">Change Password</p>
              <p className="text-xs text-gray-500">{profile?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input
              id="current-password"
              name="current-password"
              label="Current Password"
              type="password"
              placeholder="Your current password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <Input
              id="new-password"
              name="new-password"
              label="New Password"
              type="password"
              placeholder="At least 8 characters"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <Input
              id="confirm-password"
              name="confirm-password"
              label="Confirm New Password"
              type="password"
              placeholder="Repeat new password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <Button type="submit" size="lg" fullWidth disabled={saving}>
              {saving ? 'Saving…' : 'Change Password'}
            </Button>
          </form>
        </Card>

        <p className="text-xs text-gray-400 text-center px-4">
          If you've forgotten your current password, contact your Director to reset it.
        </p>
      </div>
    </Layout>
  )
}
