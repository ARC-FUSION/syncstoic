import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Mail, Palette, Save, Shield, User as UserIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../lib/types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from '../components/ui/Toaster';

const roleLabel: Record<UserRole, string> = {
  STUDENT: 'Student',
  INSTRUCTOR: 'Instructor',
  ADMIN: 'Admin',
};

const roleBadgeClass: Record<UserRole, string> = {
  STUDENT: 'border-primary-500/30 bg-primary-500/10 text-primary-300',
  INSTRUCTOR: 'border-green-500/30 bg-green-500/10 text-green-300',
  ADMIN: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
};

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setAvatarUrl(user.avatarUrl ?? '');
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = user.role ?? 'STUDENT';
  const dirty = name !== user.name || avatarUrl !== (user.avatarUrl ?? '');

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error('Name cannot be empty.');
      return;
    }
    updateUser({ name: trimmedName, avatarUrl: avatarUrl.trim() || undefined });
    toast.success('Profile updated.');
  };

  const handleLogout = () => {
    logout();
    toast.success('You have been logged out.');
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-surface pb-28 lg:pb-12">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header card */}
        <Card className="overflow-hidden border-white/10 bg-surface-light/50 p-0 text-white ring-white/10 backdrop-blur-sm">
          <div className="h-32 bg-gradient-to-r from-primary-600 to-primary-400" />
          <div className="px-8 pb-8">
            <div className="-mt-16 mb-6 flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-surface-light bg-primary-500/20">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-primary-300">{initials(user.name)}</span>
                )}
              </div>
              <div className="flex-1 sm:mb-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                  <Badge variant="outline" className={roleBadgeClass[role]}>
                    {roleLabel[role]}
                  </Badge>
                </div>
                <p className="mt-1 flex items-center gap-2 text-white/60">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Account */}
        <Card className="mt-6 border-white/10 bg-surface-light/50 text-white ring-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <UserIcon className="h-5 w-5 text-primary-400" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="profile-name" className="block text-sm font-medium text-white/80">
                Display name
              </label>
              <Input
                id="profile-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="h-11 border-white/10 bg-surface text-white placeholder:text-white/30"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="profile-avatar" className="block text-sm font-medium text-white/80">
                Avatar URL
              </label>
              <Input
                id="profile-avatar"
                type="url"
                value={avatarUrl}
                placeholder="https://example.com/avatar.png"
                onChange={(event) => setAvatarUrl(event.target.value)}
                className="h-11 border-white/10 bg-surface text-white placeholder:text-white/30"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={!dirty}
              className="bg-primary-600 text-white hover:bg-primary-500"
            >
              <Save className="h-4 w-4" />
              Save changes
            </Button>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="mt-6 border-white/10 bg-surface-light/50 text-white ring-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Palette className="h-5 w-5 text-primary-400" />
              Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { icon: Bell, label: 'Email notifications' },
              { icon: Palette, label: 'Reduce motion' },
              { icon: Shield, label: 'Private profile' },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-xl bg-surface/50 p-4"
              >
                <span className="flex items-center gap-3 text-white/80">
                  <Icon className="h-4 w-4 text-white/40" />
                  {label}
                </span>
                <Badge variant="outline" className="border-white/10 text-white/40">
                  Soon
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Danger zone */}
        <Card className="mt-6 border-red-500/20 bg-red-500/5 text-white ring-red-500/20">
          <CardHeader>
            <CardTitle className="text-red-300">Danger zone</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleLogout}
              className="bg-red-500/10 text-red-400 hover:bg-red-500/20"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
