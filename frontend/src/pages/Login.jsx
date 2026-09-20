import { useState } from "react";

const API_URL = "http://localhost:5000/api/auth/login";

function Login({ onLogin, onLoginVerifier }) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      setError("Please enter your email and password");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      window.__trustchain_token = data.token;

      if (data.role === "Verifier") {
        onLoginVerifier(data.verifier);
      } else {
        onLogin(data.student);
      }
    } catch (err) {
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">

      <div className="login-box">

        <h1>TrustChain</h1>

        <p className="login-subtitle">
          Blockchain-Based Document Verification
        </p>

        <h2>Welcome Back</h2>

        <p className="login-text">
          Login to your TrustChain account
        </p>

        {error && (
          <p style={{ color: "#e57373", marginBottom: "10px" }}>
            {error}
          </p>
        )}

        <label>Email</label>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />


        <label>Password</label>

        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />


        <label>Select Role</label>

        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option>Student</option>
          <option>Organization</option>
          <option>Verifier</option>
        </select>


        <button
          className="login-btn"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>


        <p className="register-text">
          Don't have an account?
          <span> Register</span>
        </p>

      </div>

    </div>
  );
}

export default Login;