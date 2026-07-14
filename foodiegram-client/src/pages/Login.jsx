import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { UtensilsCrossed } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import Input from "../components/common/Input";
import Button from "../components/common/Button";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ emailOrUsername: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.emailOrUsername, form.password);
      toast.success("Welcome back!");
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-strong rounded-3xl w-full max-w-sm p-8"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-coral-500 to-amber-500 flex items-center justify-center shadow-md mb-3">
            <UtensilsCrossed className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-coral-600 to-amber-600 dark:from-coral-300 dark:to-amber-300 bg-clip-text text-transparent">
            Welcome back
          </h1>
          <p className="text-sm text-ink-900/50 dark:text-amber-50/50 mt-1">
            Log in to see what everyone's eating
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email or Username"
            name="emailOrUsername"
            value={form.emailOrUsername}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />
          <Button type="submit" loading={loading} className="w-full mt-2">
            Log In
          </Button>
        </form>

        <p className="text-center text-sm mt-6 text-ink-900/60 dark:text-amber-50/60">
          Don't have an account?{" "}
          <Link to="/signup" className="text-coral-500 font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
