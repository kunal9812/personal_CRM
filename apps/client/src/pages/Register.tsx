import { useState } from "react";
import { apiClient, useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const { setAccessToken } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await apiClient.post("/auth/signup", { email, password });
      setAccessToken(res.data.accessToken);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-8">
      <div className="w-full max-w-sm animate-fade-up">

        {/* Logo */}
        <div className="mb-12 text-center">
          <p className="font-display font-light text-3xl tracking-widest2 text-cream uppercase mb-2">
            Relate
          </p>
          <p className="label-xs">Create your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-8">
          {error && (
            <p className="text-center text-xs text-red-400/80 tracking-wider animate-fade-in">
              {error}
            </p>
          )}

          <div className="space-y-6">
            <div>
              <label className="label-xs block mb-3">Email</label>
              <input
                type="email"
                className="input-bloom"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label-xs block mb-3">Password</label>
              <input
                type="password"
                className="input-bloom"
                placeholder="Choose a strong password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 border border-void/40 border-t-void rounded-full animate-spin" />
                Creating account
              </span>
            ) : (
              <>Get Started &nbsp;→</>
            )}
          </button>
        </form>

        <p className="mt-10 text-center label-xs">
          Have an account?{" "}
          <Link to="/login" className="text-cream-muted hover:text-cream transition-colors underline-offset-2 underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
