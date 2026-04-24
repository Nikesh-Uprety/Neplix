import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff, AlertCircle, LogIn, UserPlus } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { googleAuthUrl } from "@/lib/api";
import { getAuthenticatedHomeRoute } from "@/lib/portal-routing";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

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
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<"login" | "register">(defaultMode);
  const [showPass, setShowPass] = useState(false);
  const [serverError, setServerError] = useState("");
  const { login, register, googleAuthError, clearGoogleAuthError } = useAuth();

  function handleGoogleSignIn() {
    clearGoogleAuthError();
    window.location.href = googleAuthUrl;
  }

  const loginForm = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });

  async function handleLogin(data: LoginValues) {
    setServerError("");
    try {
      const user = await login(data.email, data.password);
      onClose();
      setLocation(getAuthenticatedHomeRoute(user));
    } catch (e: unknown) {
      setServerError(e instanceof Error ? e.message : "Login failed");
    }
  }

  async function handleRegister(data: RegisterValues) {
    setServerError("");
    try {
      const user = await register(data);
      onClose();
      setLocation(getAuthenticatedHomeRoute(user));
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

              {(serverError || googleAuthError) && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {googleAuthError ? "Google sign-in failed. Please try again." : serverError}
                </div>
              )}

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm font-medium flex items-center justify-center gap-3 hover:bg-white/10 transition-colors mb-4"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-[#0F172A] px-2 text-gray-500">or continue with email</span>
                </div>
              </div>

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
