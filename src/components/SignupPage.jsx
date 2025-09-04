// import React, { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import "./SignupPage.css";
// import { API_BASE_URL } from "../config"; // adjust path if needed

// export default function SignupPage() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [error, setError] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const navigate = useNavigate();

//   const handleSignup = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError("");

//     // Validate passwords match
//     if (password !== confirmPassword) {
//       setError("Passwords do not match");
//       setIsLoading(false);
//       return;
//     }

//     try {
//       const res = await fetch(`${API_BASE_URL}/auth/signup`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await res.json();
//       if (res.ok) {
//         // Show success message and redirect to login
//         navigate("/login", {
//           state: { message: "✅ Account created successfully! Please login." },
//         });
//       } else {
//         setError(data.msg || "Signup failed. Please try again.");
//       }
//     } catch (err) {
//       console.error("Fetch error:", err);
//       setError("Failed to connect to the server. Please try again later.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="signup-container">
//       <div className="signup-content">
//         <div className="signup-visual">
//           <div className="signup-hero">
//             <div className="logo">
//               <span className="logo-icon">🐨</span>
//               <h1>KoalaRoute AI</h1>
//             </div>
//             <h2>Start Your Journey</h2>
//             <p>Join thousands of travelers planning better trips with AI</p>
//             <div className="benefits-list">
//               <div className="benefit-item">
//                 <span className="benefit-icon">🤖</span>
//                 <span>AI-Powered Travel Planning</span>
//               </div>
//               <div className="benefit-item">
//                 <span className="benefit-icon">💸</span>
//                 <span>Best Price Guarantee</span>
//               </div>
//               <div className="benefit-item">
//                 <span className="benefit-icon">🌎</span>
//                 <span>Global Destination Coverage</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="signup-form-container">
//           <div className="form-header">
//             <h2>Create Your Account</h2>
//             <p>Join KoalaRoute AI and start planning better trips</p>
//           </div>

//           <form
//             onSubmit={handleSignup}
//             className="signup-form"
//             autoComplete="on"
//           >
//             {error && <div className="error-message">{error}</div>}

//             <div className="input-group">
//               <label htmlFor="email">Email Address</label>
//               <input
//                 id="email"
//                 type="email"
//                 name="email"
//                 placeholder="Enter your email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 autoComplete="username"
//                 required
//               />
//             </div>

//             <div className="input-group">
//               <label htmlFor="password">Password</label>
//               <input
//                 id="password"
//                 type="password"
//                 name="password"
//                 placeholder="Create a password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 autoComplete="new-password"
//                 required
//               />
//               <div className="password-requirements">
//                 <p>Must be at least 8 characters</p>
//               </div>
//             </div>

//             <div className="input-group">
//               <label htmlFor="confirmPassword">Confirm Password</label>
//               <input
//                 id="confirmPassword"
//                 type="password"
//                 name="confirmPassword"
//                 placeholder="Confirm your password"
//                 value={confirmPassword}
//                 onChange={(e) => setConfirmPassword(e.target.value)}
//                 autoComplete="new-password"
//                 required
//               />
//             </div>

//             <div className="terms-agreement">
//               <label className="checkbox-label">
//                 <input type="checkbox" required />
//                 <span>
//                   I agree to the <a href="#">Terms of Service</a> and{" "}
//                   <a href="#">Privacy Policy</a>
//                 </span>
//               </label>
//             </div>

//             <button
//               type="submit"
//               className={`signup-button ${isLoading ? "loading" : ""}`}
//               disabled={isLoading}
//             >
//               {isLoading ? (
//                 <>
//                   <span className="spinner"></span>
//                   Creating Account...
//                 </>
//               ) : (
//                 "Create Account"
//               )}
//             </button>
//           </form>

//           <div className="login-link">
//             <p>
//               Already have an account? <Link to="/login">Sign in here</Link>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../config";
import "./SignupPage.css";

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setStep(2);
      } else {
        setError(data.msg || "Failed to send OTP");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password }),
      });

      const data = await res.json();
      if (res.ok) {
        navigate("/login", {
          state: { message: "✅ Account created successfully! Please login." },
        });
      } else {
        setError(data.msg || "Signup failed. Please try again.");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-content">
        <div className="signup-visual">
          <div className="signup-hero">
            <div className="logo">
              <span className="logo-icon">🐨</span>
              <h1>KoalaRoute AI</h1>
            </div>
            <h2>Join our community!</h2>
            <p>Create an account to start your travel planning journey</p>
            <div className="illustration">
              <div className="travel-icons">
                <span className="icon-plane">✈️</span>
                <span className="icon-hotel">🏨</span>
                <span className="icon-map">🗺️</span>
              </div>
            </div>
          </div>
        </div>

        <div className="signup-form-container">
          <div className="form-header">
            <h2>Create Your Account</h2>
            <p>Join us to get started with our services</p>

            {/* Progress Indicator */}
            <div className="signup-progress">
              <div className={`progress-step ${step >= 1 ? "active" : ""}`}>
                <span>1</span>
                <p>Email</p>
              </div>
              <div className="progress-line"></div>
              <div className={`progress-step ${step >= 2 ? "active" : ""}`}>
                <span>2</span>
                <p>Verification</p>
              </div>
            </div>
          </div>

          {step === 1 ? (
            <form
              onSubmit={handleSendOtp}
              className="signup-form"
              autoComplete="on"
            >
              {error && <div className="error-message">{error}</div>}

              <div className="input-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>

              <button
                type="submit"
                className={`signup-button ${isLoading ? "loading" : ""}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Sending OTP...
                  </>
                ) : (
                  "Continue to Verification"
                )}
              </button>
            </form>
          ) : (
            <form
              onSubmit={handleSignup}
              className="signup-form"
              autoComplete="on"
            >
              {error && <div className="error-message">{error}</div>}

              <div className="input-group">
                <label htmlFor="otp">Verification Code</label>
                <input
                  id="otp"
                  type="text"
                  name="otp"
                  placeholder="Enter the code sent to your email"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
                <p className="otp-note">
                  Check your inbox for the verification code
                </p>
              </div>

              <div className="input-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Create a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>

              <button
                type="submit"
                className={`signup-button ${isLoading ? "loading" : ""}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
          )}

          <div className="login-link">
            <p>
              Already have an account? <Link to="/login">Sign in here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
