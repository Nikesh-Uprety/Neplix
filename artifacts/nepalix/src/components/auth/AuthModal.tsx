import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff, AlertCircle, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "login" | "register";
};

const inputClass = (error: boolean) =>
  `w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-gray-500 text-sm focus:outline-none transition-colors ${
    error
      ? "border-red-500/50 focus:border-red-500"
      : "border-white/10 focus:border-[#06B6D4]/60"
  }`;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
      <AlertCircle className="w-3 h-3 flex-shrink-0" />
      {message}
    </p>
  );
}

export function AuthModal({ isOpen, onClose, defaultMode = "login" }: Props) {
  const [mode, setMode] = useState<"login" | "register">(defaultMode);
  const [showPass, setShowPass] = useState(false);
  const [serverError, setServerError] = useState("");
  const { login, register } = useAuth();

  const loginForm = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });

  async function handleLogin(data: LoginValues) {
    setServerError("");
    try {
      await login(data.email, data.password);
      onClose();
    } catch (e: unknown) {
      setServerError(e instanceof Error ? e.message : "Login failed");
    }
  }

  async function handleRegister(data: RegisterValues) {
    setServerError("");
    try {
      await register(data);
      onClose();
    } catch (e: unknown) {
      setServerError(e instanceof Error ? e.message : "Registration failed");
    }
  }

  function switchMode(m: "login" | "register") {
    setMode(m);
    setServerError("");
    loginForm.reset();
    registerForm.reset();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0F172A] p-8 shadow-2xl relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6 text-center">
                <div className="inline-flex rounded-xl border border-white/10 p-1 mb-5 bg-white/5">
                  <button
                    onClick={() => switchMode("login")}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      mode === "login"
                        ? "bg-[#06B6D4]/20 text-cyan-400"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Sign In
                  </button>
                  <button
                    onClick={() => switchMode("register")}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      mode === "register"
                        ? "bg-[#06B6D4]/20 text-cyan-400"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Sign Up
                  </button>
                </div>
                <h2 className="text-2xl font-bold text-white font-heading">
                  {mode === "login" ? "Welcome back" : "Create account"}
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  {mode === "login"
                    ? "Sign in to your NEPALIX account"
                    : "Join NEPALIX — Nepal's #1 commerce platform"}
                </p>
              </div>

              {serverError && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {serverError}
                </div>
              )}

              <AnimatePresence mode="wait">
                {mode === "login" ? (
                  <motion.form
                    key="login"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.15 }}
                    onSubmit={loginForm.handleSubmit(handleLogin)}
                    className="space-y-4"
                    noValidate
                  >
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">
                        Email
                      </label>
                      <input
                        {...loginForm.register("email")}
                        type="email"
                        className={inputClass(!!loginForm.formState.errors.email)}
                        placeholder="you@company.com"
                        autoComplete="email"
                      />
                      <FieldError
                        message={loginForm.formState.errors.email?.message}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          {...loginForm.register("password")}
                          type={showPass ? "text" : "password"}
                          className={inputClass(
                            !!loginForm.formState.errors.password
                          )}
                          placeholder="••••••••"
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showPass ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <FieldError
                        message={loginForm.formState.errors.password?.message}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loginForm.formState.isSubmitting}
                      className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      style={{
                        background: "linear-gradient(135deg, #06B6D4, #3B82F6)",
                      }}
                    >
                      {loginForm.formState.isSubmitting ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </button>
                  </motion.form>
                ) : (
                  <motion.form
                    key="register"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    onSubmit={registerForm.handleSubmit(handleRegister)}
                    className="space-y-4"
                    noValidate
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1.5">
                          First Name
                        </label>
                        <input
                          {...registerForm.register("firstName")}
                          className={inputClass(
                            !!registerForm.formState.errors.firstName
                          )}
                          placeholder="Aarav"
                        />
                        <FieldError
                          message={
                            registerForm.formState.errors.firstName?.message
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1.5">
                          Last Name
                        </label>
                        <input
                          {...registerForm.register("lastName")}
                          className={inputClass(
                            !!registerForm.formState.errors.lastName
                          )}
                          placeholder="Sharma"
                        />
                        <FieldError
                          message={
                            registerForm.formState.errors.lastName?.message
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">
                        Email
                      </label>
                      <input
                        {...registerForm.register("email")}
                        type="email"
                        className={inputClass(
                          !!registerForm.formState.errors.email
                        )}
                        placeholder="you@company.com"
                        autoComplete="email"
                      />
                      <FieldError
                        message={registerForm.formState.errors.email?.message}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          {...registerForm.register("password")}
                          type={showPass ? "text" : "password"}
                          className={inputClass(
                            !!registerForm.formState.errors.password
                          )}
                          placeholder="Min 8 characters"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showPass ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <FieldError
                        message={registerForm.formState.errors.password?.message}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={registerForm.formState.isSubmitting}
                      className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      style={{
                        background: "linear-gradient(135deg, #06B6D4, #3B82F6)",
                      }}
                    >
                      {registerForm.formState.isSubmitting ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
