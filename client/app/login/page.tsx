"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Snowflake,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Sun,
  Moon,
  Check,
} from "lucide-react";
import { useAuth } from "@/src/providers/auth-context";
import { useThemeMode } from "@/src/hooks/useThemeMode";

function getLoginErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;

    if (Array.isArray(message)) {
      const text = message
        .filter((item): item is string => typeof item === "string")
        .join(" ");
      if (text) return text;
    }

    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
}

export default function App() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { theme, toggleTheme } = useThemeMode();
  const isDarkMode = theme === "dark";
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(username, password);
      router.replace("/");
    } catch (loginError) {
      setError(getLoginErrorMessage(loginError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${isDarkMode ? "mesh-gradient-dark text-slate-200" : "mesh-gradient-light text-slate-800"}`}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px] opacity-20 ${isDarkMode ? "bg-sky-400" : "bg-sky-500"}`}
        />
        <div
          className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[120px] opacity-10 ${isDarkMode ? "bg-purple-400" : "bg-purple-500"}`}
        />
      </div>

      <button
        type="button"
        onClick={toggleTheme}
        className={`absolute top-6 right-6 p-2 rounded-full glass-card border transition-all hover:scale-110 ${isDarkMode ? "bg-white/10 border-white/10 text-sky-300" : "bg-black/5 border-black/5 text-sky-600"}`}
        aria-label="Toggle theme"
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <main className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-10 space-y-4">
          <div
            className={`w-16 h-16 rounded-2xl glass-card flex items-center justify-center border shadow-xl ${isDarkMode ? "bg-white/10 border-white/20" : "bg-white/40 border-white/60"}`}
          >
            <Snowflake
              className={isDarkMode ? "text-sky-400" : "text-sky-500"}
              size={36}
              fill="currentColor"
              fillOpacity={0.2}
            />
          </div>
          <div className="text-center">
            <h1
              className={`text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-b ${isDarkMode ? "from-sky-300 to-sky-500" : "from-sky-500 to-sky-700"}`}
            >
              Personal NAS
            </h1>
            <p
              className={`font-medium mt-2 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
            >
              Đăng nhập vào NAS của bạn
            </p>
          </div>
        </div>

        <section
          className={`glass-card rounded-3xl p-8 border shadow-2xl ${isDarkMode ? "bg-slate-900/60 border-white/10" : "bg-white/40 border-white/80"}`}
        >
          {error && (
            <div
              className={`mb-6 flex items-center gap-3 p-3 rounded-xl border text-sm ${isDarkMode ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-red-50 border-red-100 text-red-600"}`}
            >
              <AlertCircle size={18} />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label
                className={`text-xs font-bold uppercase tracking-widest ml-1 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
              >
                Tên đăng nhập
              </label>
              <div className="pt-1 relative group">
                <User
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isDarkMode ? "text-slate-500 group-focus-within:text-sky-400" : "text-slate-400 group-focus-within:text-sky-500"}`}
                  size={18}
                />
                <input
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="admin"
                  autoComplete="username"
                  disabled={isSubmitting}
                  className={`w-full h-14 pl-12 pr-4 rounded-2xl border outline-none transition-all disabled:cursor-not-allowed disabled:opacity-70 ${
                    isDarkMode
                      ? "bg-white/5 border-white/5 focus:border-sky-500/50 focus:bg-white/10 text-white"
                      : "bg-white/50 border-slate-200 focus:border-sky-500/50 focus:bg-white text-slate-900"
                  }`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label
                  className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
                >
                  Mật khẩu
                </label>
                <a
                  href="#"
                  className={`text-xs font-bold transition-colors ${isDarkMode ? "text-sky-400 hover:text-sky-300" : "text-sky-600 hover:text-sky-700"}`}
                >
                  Quên mật khẩu?
                </a>
              </div>
              <div className="relative group">
                <Lock
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isDarkMode ? "text-slate-500 group-focus-within:text-sky-400" : "text-slate-400 group-focus-within:text-sky-500"}`}
                  size={18}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  className={`w-full h-14 pl-12 pr-12 rounded-2xl border outline-none transition-all disabled:cursor-not-allowed disabled:opacity-70 ${
                    isDarkMode
                      ? "bg-white/5 border-white/5 focus:border-sky-500/50 focus:bg-white/10 text-white"
                      : "bg-white/50 border-slate-200 focus:border-sky-500/50 focus:bg-white text-slate-900"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors hover:text-sky-400 disabled:cursor-not-allowed disabled:opacity-60 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-3 px-1">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  disabled={isSubmitting}
                  className={`peer w-5 h-5 rounded-lg border transition-all cursor-pointer appearance-none checked:bg-sky-500 disabled:cursor-not-allowed ${isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"}`}
                />
                <Check
                  size={12}
                  className="absolute left-1 text-white opacity-0 pointer-events-none transition-opacity peer-checked:opacity-100"
                />
              </div>
              <label
                htmlFor="remember"
                className={`text-sm font-medium cursor-pointer ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
              >
                Ghi nhớ đăng nhập
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full h-14 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all group disabled:cursor-not-allowed disabled:opacity-70 ${
                isDarkMode
                  ? "bg-sky-500/20 border border-sky-500/40 text-sky-300 hover:bg-sky-500/30 shadow-sky-500/10"
                  : "bg-sky-500 border border-sky-500 text-white hover:bg-sky-600 shadow-sky-500/20"
              }`}
            >
              <span>{isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}</span>
              <ArrowRight
                size={20}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>
          </form>
        </section>

        <footer className="mt-10 flex justify-center items-center space-x-6 text-sm font-bold">
          <a
            href="#"
            className={`transition-colors ${isDarkMode ? "text-slate-500 hover:text-sky-400" : "text-slate-400 hover:text-sky-600"}`}
          >
            Hỗ trợ
          </a>
          <span
            className={`w-1 h-1 rounded-full ${isDarkMode ? "bg-slate-700" : "bg-slate-200"}`}
          />
          <a
            href="#"
            className={`transition-colors ${isDarkMode ? "text-slate-500 hover:text-sky-400" : "text-slate-400 hover:text-sky-600"}`}
          >
            Điều khoản
          </a>
          <span
            className={`w-1 h-1 rounded-full ${isDarkMode ? "bg-slate-700" : "bg-slate-200"}`}
          />
          <a
            href="#"
            className={`transition-colors ${isDarkMode ? "text-slate-500 hover:text-sky-400" : "text-slate-400 hover:text-sky-600"}`}
          >
            Bảo mật
          </a>
        </footer>
      </main>
    </div>
  );
}
