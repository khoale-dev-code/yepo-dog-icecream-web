import { Loader2 } from "lucide-react";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { LoginView } from "../views/LoginView";

export function ProtectedAdmin({ children }) {
  const auth = useAdminAuth();

  if (auth.checking) {
    return (
      <main className="grid min-h-dvh place-items-center bg-[#FFFAFA] text-[#b98c49]">
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin text-[#b98c49]" size={38} />
          <p className="mt-3 text-sm font-brand text-[#6f5a3e]">
            Đang kiểm tra đăng nhập...
          </p>
        </div>
      </main>
    );
  }

  if (!auth.admin) {
    return (
      <LoginView
        checking={auth.checking}
        error={auth.authError}
        onLogin={auth.login}
      />
    );
  }

  return children({
    admin: auth.admin,
    logout: auth.logout,
  });
}



