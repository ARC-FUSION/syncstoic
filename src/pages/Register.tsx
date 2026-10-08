import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { registerSchema, type RegisterFormData } from '../lib/validations/auth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { toast } from '../components/ui/Toaster';

interface FromState {
  from?: { pathname?: string };
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register: registerUser, isLoading } = useAuth();

  const state = location.state as FromState | null;
  const redirectTo = state?.from?.pathname ?? '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const busy = isSubmitting || isLoading;

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const user = await registerUser(data.name, data.email, data.password);
      toast.success(`Account created. Welcome, ${user.name}!`);
      navigate(redirectTo, { replace: true });
    } catch {
      toast.error('Registration failed. Please try again.');
    }
  };

  const handleGoogle = () => {
    toast('Coming soon', { description: 'Google sign-up will be available soon.' });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/20">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-white">Create your account</h1>
          <p className="text-white/60">Start your learning journey today</p>
        </div>

        <Card className="gap-6 border-white/10 bg-surface-light/80 py-6 text-white ring-white/10 backdrop-blur-sm">
          <CardHeader className="px-6">
            <CardTitle className="text-lg text-white">Sign up</CardTitle>
            <CardDescription className="text-white/50">
              It only takes a moment to get started
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 px-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogle}
              disabled={busy}
              className="h-11 w-full border-white/10 bg-white/5 text-white hover:bg-white/10"
            >
              <GoogleIcon />
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-surface-light px-2 text-xs uppercase tracking-wider text-white/40">
                  Or continue with email
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-white/80">
                  Full name
                </label>
                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="John Doe"
                  aria-invalid={Boolean(errors.name)}
                  className="h-11 border-white/10 bg-surface text-white placeholder:text-white/30"
                  {...register('name')}
                />
                {errors.name && <p className="text-sm text-red-400">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-white/80">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  aria-invalid={Boolean(errors.email)}
                  className="h-11 border-white/10 bg-surface text-white placeholder:text-white/30"
                  {...register('email')}
                />
                {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-white/80">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  aria-invalid={Boolean(errors.password)}
                  className="h-11 border-white/10 bg-surface text-white placeholder:text-white/30"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-sm text-red-400">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-white/80"
                >
                  Confirm password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  aria-invalid={Boolean(errors.confirmPassword)}
                  className="h-11 border-white/10 bg-surface text-white placeholder:text-white/30"
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-400">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={busy}
                className="h-11 w-full bg-primary-600 text-white hover:bg-primary-500"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {busy ? 'Creating account...' : 'Create account'}
              </Button>
            </form>

            <p className="text-center text-sm text-white/60">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary-400 hover:text-primary-300">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
