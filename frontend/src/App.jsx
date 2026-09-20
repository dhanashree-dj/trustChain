import { useState } from "react";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import StudentProfile from "./pages/StudentProfile";
import DocumentUpload from "./pages/DocumentUpload";
import VerifyDocument from "./pages/VerifyDocument";
import VerifierDashboard from "./pages/VerifierDashboard";
import "./App.css";

function App() {

  const [page, setPage] = useState("home");
const [loggedInStudent, setLoggedInStudent] = useState(null);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loggedInVerifier, setLoggedInVerifier] = useState(null);

  function goHome() {
    setPage("home");
  }

  function goLogin() {
    setPage("login");
  }

     function goVerify() {
        setPage("verify");
    }
    if (page === "verify") {
        return (
            <div className="app">
                <VerifyDocument onBack={goDashboard} />
            </div>
        );
    }

 function goDashboard(loggedInStudent) {
    if (loggedInStudent) {
        setLoggedInStudent(loggedInStudent);
    }
    setPage("dashboard");
}

function goVerifierDashboard(verifier) {
    setLoggedInVerifier(verifier);
    setPage("verifierDashboard");
}
if (page === "verifierDashboard") {
    return (
      <div className="app">
        <VerifierDashboard verifier={loggedInVerifier} onLogout={goHome} />
      </div>
    );
}

  // ADD THESE HERE
  function goProfile(student) {
    setSelectedStudent(student);
    setPage("profile");
  }

 function goUpload() {
    setPage("upload");
}

  // LOGIN PAGE
  if (page === "login") {
    return (
      <div className="app">

        <Login
  onLogin={goDashboard}
  onBackHome={goHome}
  onLoginVerifier={goVerifierDashboard}
/>
      </div>
    );
  }

  // DASHBOARD PAGE
  if (page === "dashboard") {
    return (
      <div className="app">

        <StudentDashboard
          onHome={goHome}
          onLogout={goHome}
          onVerify={goVerify}
          onViewDocuments={goProfile}
        />

      </div>
    );
  }

  // STUDENT PROFILE PAGE
  if (page === "profile") {
    return (
      <div className="app">

        <StudentProfile
  student={selectedStudent}
  onBack={goDashboard}
  onUpload={goUpload}
  onVerify={goVerify}
/>

      </div>
    );
  }
  if (page === "upload") {
    return (
      <div className="app">
        <DocumentUpload
          student={selectedStudent}
          onBack={() => goProfile(selectedStudent)}
        />
      </div>
    );
}

  // HOME PAGE
  return (
    <div className="app">

      {/* NAVBAR */}
      <nav className="navbar">

        <div className="logo">
          Trust<span>Chain</span>
        </div>

        <div className="nav-links">

          <button
            onClick={goHome}
            className="nav-btn active"
          >
            Home
          </button>

          <button
            onClick={goDashboard}
            className="nav-btn"
          >
            Dashboard
          </button>

          <button
            onClick={goLogin}
            className="nav-login-btn"
          >
            Login
          </button>

        </div>

      </nav>


      {/* HERO SECTION */}
      <section className="hero-section">

        <div className="hero-content">

          <p className="hero-tag">
            BLOCKCHAIN • AI • SECURITY
          </p>

          <h1>
            Verify
            <br />

            <span>Documents.</span>

            <br />

            Trust the
            <br />

            <span>Chain.</span>
          </h1>

          <p className="hero-description">
            TrustChain is a blockchain-based document verification
            platform that makes certificates secure, transparent
            and tamper-proof.
          </p>

          <div className="hero-buttons">

            <button
              className="primary-btn"
              onClick={goLogin}
            >
              Verify Document →
            </button>

            <button
              className="secondary-btn"
              onClick={goLogin}
            >
              Explore Dashboard
            </button>

          </div>

        </div>


        {/* BLOCKCHAIN ANIMATION */}
        <div className="blockchain-animation">

          <div className="floating-block block-one">
            🔗
          </div>

          <div className="floating-block block-two">
            📄
          </div>

          <div className="floating-block block-three">
            🔐
          </div>

          <div className="chain-line line-one"></div>

          <div className="chain-line line-two"></div>

          <div className="central-block">

            <div className="chain-icon">
              ⛓
            </div>

            <h2>
              Blockchain
            </h2>

            <p>
              Secured Verification
            </p>

            <div className="status">
              <span></span>
              Network Active
            </div>

          </div>

        </div>

      </section>

      


      {/* FEATURES */}
      <section className="features-section">

        <p className="section-tag">
          WHY TRUSTCHAIN?
        </p>

        <h2>
          Built for <span>Trust.</span>
        </h2>

        <p className="section-description">
          Every document is protected using blockchain technology,
          cryptographic hashing and intelligent verification.
        </p>


        <div className="features-grid">

          {/* SECURE */}
          <div className="feature-card">

            <div className="feature-icon">
              🔐
            </div>

            <h3>
              Secure
            </h3>

            <p>
              Documents are protected using cryptographic
              hashing and secure verification.
            </p>

            <div className="feature-hover">

              <h4>
                🔐 Secure
              </h4>

              <p>
                Every uploaded document is converted into a
                unique cryptographic hash. Sensitive document
                data is not directly stored on the blockchain.
              </p>

              <strong>
                Hash Based Protection
              </strong>

            </div>

          </div>


          {/* IMMUTABLE */}
          <div className="feature-card">

            <div className="feature-icon">
              🔗
            </div>

            <h3>
              Immutable
            </h3>

            <p>
              Blockchain records cannot be secretly modified
              or deleted.
            </p>

            <div className="feature-hover">

              <h4>
                🔗 Immutable
              </h4>

              <p>
                Once a document verification record is stored
                on the blockchain, changing the record would
                require altering the blockchain data.
              </p>

              <strong>
                Tamper Resistant Records
              </strong>

            </div>

          </div>


          {/* AI POWERED */}
          <div className="feature-card">

            <div className="feature-icon">
              🤖
            </div>

            <h3>
              AI Powered
            </h3>

            <p>
              AI can assist in identifying suspicious or
              inconsistent documents.
            </p>

            <div className="feature-hover">

              <h4>
                🤖 AI Powered
              </h4>

              <p>
                AI can analyze document information, detect
                inconsistencies and assist the verification
                process.
              </p>

              <strong>
                Intelligent Verification
              </strong>

            </div>

          </div>

        </div>

      </section>


      {/* STATS */}
      <section className="stats-section">

        <div className="stat">
          <h2>100%</h2>
          <p>Blockchain Records</p>
        </div>

        <div className="stat">
          <h2>24/7</h2>
          <p>Verification</p>
        </div>

        <div className="stat">
          <h2>AI</h2>
          <p>Assisted Detection</p>
        </div>

        <div className="stat">
          <h2>0</h2>
          <p>Centralized Trust</p>
        </div>

      </section>

      


      {/* FOOTER */}
      <footer>

        <h2>
          Trust<span>Chain</span>
        </h2>

        <p>
          Blockchain-Based Document Verification
        </p>

        <p className="footer-small">
          © 2026 TrustChain
        </p>

      </footer>

    </div>
  );
}

export default App;