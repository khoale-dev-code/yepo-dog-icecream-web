import { Eye, EyeOff, Loader2, Lock, UserRound } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export function LoginView({ checking, error, onLogin }) {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setSubmitting(true);

    await onLogin(form);

    setSubmitting(false);
  }

  return (
    <main className="grid min-h-dvh place-items-center overflow-hidden bg-[#FFFAFA] px-4 py-8 text-[#3b2a18]">
      <div className="w-full max-w-md">
        <div className="mb-5 text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-[28px] bg-[#b98c49] text-white shadow-xl">
            <Lock size={34} />
          </div>

          <p className="mt-5 text-xs font-brand uppercase tracking-[0.22em] text-[#b98c49]">
            YEPO Admin
          </p>

          <h1 className="font-sniglet mt-2 text-5xl leading-none">
            Đăng nhập
          </h1>

          <p className="mt-3 text-sm font-semibold leading-7 text-[#6f5a3e]">
            Vui lòng đăng nhập để quản lý menu, topping, bài đăng, khuyến mãi và đặt bàn.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[34px] border border-[#d8b77e] bg-white p-5 shadow-[0_24px_80px_rgba(74,45,25,.12)] sm:p-6"
        >
          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-brand text-red-700">
              {error}
            </div>
          )}

          <label className="block">
            <span className="mb-2 block text-sm font-brand">Tài khoản</span>

            <div className="relative">
              <UserRound
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b98c49]"
              />

              <input
                value={form.username}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    username: event.target.value,
                  }))
                }
                placeholder="Nhập tài khoản admin"
                autoComplete="username"
                className="h-13 w-full rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] pl-12 pr-4 text-sm font-medium outline-none transition focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10"
              />
            </div>
          </label>

          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-brand">Mật khẩu</span>

            <div className="relative">
              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b98c49]"
              />

              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                placeholder="Nhập mật khẩu"
                autoComplete="current-password"
                className="h-13 w-full rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] pl-12 pr-12 text-sm font-medium outline-none transition focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10"
              />

              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#b98c49]"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          <button
            type="submit"
            disabled={checking || submitting}
            className="mt-5 inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#b98c49] px-5 text-sm font-brand uppercase tracking-[0.1em] text-white transition hover:bg-[#8c672f] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {checking || submitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Lock size={18} />
            )}
            Đăng nhập
          </button>

          <Link
            to="/"
            className="mt-4 inline-flex w-full justify-center rounded-2xl bg-[#f7efe3] px-5 py-3 text-sm font-brand text-[#8c672f]"
          >
            Quay về website
          </Link>
        </form>
      </div>
    </main>
  );
}




