import React from "react";
import { useAuth } from "../../hooks/useAuth";

export const Header: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shadow-sm">
      <div>
        <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
          Hotel Management System
        </h2>
      </div>
      <div className="flex items-center space-x-4">
        {user && (
          <div className="flex items-center space-x-3 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-sm">
              <div className="font-semibold text-slate-900">{user.name}</div>
              <div className="text-slate-500 text-xs">{user.email}</div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
