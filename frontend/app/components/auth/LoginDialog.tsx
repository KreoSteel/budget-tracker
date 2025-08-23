import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { LogIn } from "lucide-react";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin: (email: string, password: string) => Promise<boolean>;
  onSwitchToRegister: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export function LoginDialog({
  open,
  onOpenChange,
  onLogin,
  onSwitchToRegister,
  isLoading = false,
  error = null,
}: LoginDialogProps) {
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onLogin(formData.email, formData.password);
    if (success) {
      setFormData({ email: '', password: '' });
    }
  };

  const handleSwitchToRegister = () => {
    onSwitchToRegister();
    setFormData({ email: '', password: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-[var(--color-text-light)]">
            Welcome Back
          </DialogTitle>
          <DialogDescription className="text-[var(--color-text-muted)]">
            Sign in to your Finance Tracker account
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-6">
          {error && (
            <div className="mb-4 p-3 bg-[var(--color-error-light)] border border-[var(--color-error-dark)] text-[var(--color-error-dark)] rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-[var(--color-text-light)]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="border-[var(--color-border-dark)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-[var(--color-text-light)]">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="border-[var(--color-border-dark)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-1/3 flex justify-center items-center mx-auto bg-[var(--color-sidebar-hover)] hover:bg-[var(--color-sidebar-hover-dark)] text-[var(--color-text-light)] font-semibold py-2 disabled:opacity-50 hover:scale-110 cursor-pointer active:scale-95 transition-all duration-300"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
          
          <Separator className="my-6" />
          
          <div className="text-center">
            <p className="text-sm text-[var(--color-text-muted)]">
              Don't have an account?{' '}
              <button
                onClick={handleSwitchToRegister}
                className="text-[var(--color-primary)] hover:underline font-medium"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
