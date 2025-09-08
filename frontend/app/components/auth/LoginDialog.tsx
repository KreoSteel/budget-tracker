import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { authService } from "~/services/authService";
import type { LoginCredentials } from "~/services/authService";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginSuccess: (user: any) => void;
  onSwitchToRegister?: () => void;
}

export function LoginDialog({
  open,
  onOpenChange,
  onLoginSuccess,
  onSwitchToRegister,
}: LoginDialogProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const credentials: LoginCredentials = { email, password };
    const result = await authService.login(credentials);

    if (result.success && result.user) {
      setEmail("");
      setPassword("");
      onLoginSuccess(result.user);
      onOpenChange(false);
    } else {
      setError(result.error || 'Login failed');
    }

    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto bg-gray-900 border border-gray-700 shadow-2xl">
        <DialogHeader className="text-center mb-6">
          <DialogTitle className="text-2xl font-bold text-white mb-2">Sign In</DialogTitle>
          <DialogDescription className="text-gray-400">
            Enter your credentials to access your account
          </DialogDescription>
        </DialogHeader>
          
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-300">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
            </div>
          </div>
            
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}
          
          <div className="space-y-4">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
            
            {onSwitchToRegister && (
              <div className="text-center">
                <p className="text-gray-400 text-sm">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      onOpenChange(false);
                      onSwitchToRegister();
                    }}
                    className="text-blue-400 hover:text-blue-300 font-medium"
                  >
                    Create one here
                  </button>
                </p>
              </div>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
