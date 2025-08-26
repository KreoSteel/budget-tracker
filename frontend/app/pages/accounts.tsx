import { useState } from "react";
import Sidebar from "~/components/layouts/Sidebar";
import { useNavigate } from "react-router";
import AccountCard from "~/components/cards/AccountCard";

export default function Accounts() {
  const [selectedItem, setSelectedItem] = useState('accounts');
  const navigate = useNavigate();

  const handleItemSelect = (item: string) => {
    setSelectedItem(item);
    
    // Navigate to the appropriate route
    if (item === 'dashboard') {
      navigate('/');
    } else {
      navigate(`/${item}`);
    }
  };

  return (
    <div className="flex h-screen w-[60vw]">
      <Sidebar
        selectedItem={selectedItem}
        onItemSelect={handleItemSelect}
      />

      {/* Accounts Content */}
      <div className="flex-1 p-10 flex flex-col gap-10 font-source-sans bg-[var(--color-background-dark-secondary)]">
        <span className="flex flex-col gap-3">
          <h1 className="text-4xl font-semibold">Accounts</h1>
          <p className="text-lg text-gray-500">Manage your bank accounts and financial accounts.</p>
        </span>

        {/* Accounts Cards */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col gap-4">
            <AccountCard />
          </div>
        </div>
      </div>
    </div>
  );
}