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
import type { RegisterCredentials } from "~/services/authService";

interface RegisterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegisterSuccess: (user: any) => void;
  onSwitchToLogin?: () => void;
}

export function RegisterDialog({
  open,
  onOpenChange,
  onRegisterSuccess,
  onSwitchToLogin,
}: RegisterDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    const credentials: RegisterCredentials = { name, email, password };
    const result = await authService.register(credentials);

    if (result.success && result.user) {
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      onRegisterSuccess(result.user);
      onOpenChange(false);
    } else {
      setError(result.error || 'Registration failed');
    }

    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto bg-gray-900 border border-gray-700 shadow-2xl">
        <DialogHeader className="text-center mb-6">
          <DialogTitle className="text-2xl font-bold text-white mb-2">Create Account</DialogTitle>
          <DialogDescription className="text-gray-400">
            Enter your information to create a new account
          </DialogDescription>
        </DialogHeader>
          
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-300">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-green-500"
                placeholder="Enter your full name"
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-green-500"
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
                className="w-full bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-green-500"
                placeholder="Create a password (min 6 characters)"
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-300">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-green-500"
                placeholder="Confirm your password"
                required
                disabled={isLoading}
                minLength={6}
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
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
            
            {onSwitchToLogin && (
              <div className="text-center">
                <p className="text-gray-400 text-sm">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      onOpenChange(false);
                      onSwitchToLogin();
                    }}
                    className="text-green-400 hover:text-green-300 font-medium"
                  >
                    Sign in here
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
