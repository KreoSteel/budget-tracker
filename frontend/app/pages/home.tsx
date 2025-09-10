import { useState } from "react";
import { Button } from "~/components/ui/button";
import { LoginDialog } from "~/components/auth/LoginDialog";
import { RegisterDialog } from "~/components/auth/RegisterDialog";
import { authService } from "~/services/authService";
import type { User } from "~/types/User";
import { useNavigate } from "react-router";

export default function Home() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const navigate = useNavigate();

  const handleLoginSuccess = (user: User) => {
    navigate('/dashboard');
  };

  const handleRegisterSuccess = (user: User) => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            {/* Logo */}
            <div className="mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto lg:mx-0 mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">FinanceTracker</h1>
              <p className="text-gray-400 text-xl">Manage your money, track your goals</p>
            </div>

            {/* Main Content */}
            <div className="mb-8">
              <h2 className="text-3xl font-semibold text-white mb-6">Welcome to Your Financial Dashboard</h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-8">
                Take control of your finances with our comprehensive budgeting and expense tracking platform. 
                Set goals, monitor spending, and achieve financial freedom.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button 
                onClick={() => setIsRegisterOpen(true)} 
                variant="default"
                size="xl"
                className="flex-1"
              >
                Get Started
              </Button>
              <Button 
                onClick={() => setIsLoginOpen(true)} 
                variant="outline" 
                size="xl"
                className="flex-1"
              >
                Sign In
              </Button>
            </div>
          </div>

          {/* Right Column - Features */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <h3 className="text-2xl font-semibold text-white mb-8 text-center">What you can do:</h3>
            <div className="space-y-6">
              <div className="flex items-start text-gray-300">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-4 mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Track Expenses</h4>
                  <p className="text-sm">Monitor your spending patterns and categorize transactions</p>
                </div>
              </div>
              <div className="flex items-start text-gray-300">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-4 mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Set Goals</h4>
                  <p className="text-sm">Create and monitor financial goals with progress tracking</p>
                </div>
              </div>
              <div className="flex items-start text-gray-300">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-4 mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Manage Accounts</h4>
                  <p className="text-sm">Connect and manage multiple bank accounts in one place</p>
                </div>
              </div>
              <div className="flex items-start text-gray-300">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-4 mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Analytics & Insights</h4>
                  <p className="text-sm">Get detailed reports and insights about your finances</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-700 text-center">
          <p className="text-gray-500 text-sm">
            Created by kreosteel
          </p>
        </div>
      </div>

      {/* Dialogs */}
      <LoginDialog
        open={isLoginOpen}
        onOpenChange={setIsLoginOpen}
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={() => {
          setIsLoginOpen(false);
          setIsRegisterOpen(true);
        }}
      />
      <RegisterDialog
        open={isRegisterOpen}
        onOpenChange={setIsRegisterOpen}
        onRegisterSuccess={handleRegisterSuccess}
        onSwitchToLogin={() => {
          setIsRegisterOpen(false);
          setIsLoginOpen(true);
        }}
      />
    </div>
  );
}
