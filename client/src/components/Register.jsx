import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("freelancer");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await axios.post("/api/auth/register", {
        firstName,
        lastName,
        email,
        password,
        role,
      });
      setMessage("Registration successful! Please login.");
      // Automatically redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-base-200">
      {/* Left side - Brand showcase */}
      <div className="flex-1 bg-primary text-primary-content p-8 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-focus opacity-90"></div>
        
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="currentColor">
            <pattern id="pattern-circles" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse" patternContentUnits="userSpaceOnUse">
              <circle id="pattern-circle" cx="10" cy="10" r="1.6257413380501518"></circle>
            </pattern>
            <rect id="rect" x="0" y="0" width="100%" height="100%" fill="url(#pattern-circles)"></rect>
          </svg>
        </div>
        
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">FreelanceFlow</h1>
          <p className="text-xl opacity-90">Start your freelance journey today</p>
        </div>
        
        <div className="space-y-6 relative z-10">
          <div className="bg-primary-content/10 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-start space-x-4">
              <div className="text-xl font-bold">1</div>
              <div>
                <h3 className="font-semibold">Create your account</h3>
                <p className="opacity-90 text-sm">Sign up as a freelancer or client in minutes</p>
              </div>
            </div>
          </div>
          
          <div className="bg-primary-content/10 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-start space-x-4">
              <div className="text-xl font-bold">2</div>
              <div>
                <h3 className="font-semibold">Complete your profile</h3>
                <p className="opacity-90 text-sm">Showcase your skills or describe your project needs</p>
              </div>
            </div>
          </div>
          
          <div className="bg-primary-content/10 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-start space-x-4">
              <div className="text-xl font-bold">3</div>
              <div>
                <h3 className="font-semibold">Start collaborating</h3>
                <p className="opacity-90 text-sm">Connect with clients or hire talented freelancers</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 text-sm opacity-80">
          © 2025 FreelanceFlow. All rights reserved.
        </div>
      </div>
      
      {/* Right side - Register form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="card w-full max-w-md bg-base-100 shadow-xl">
          <div className="card-body p-8">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl font-bold">Create account</h2>
              <p className="text-base-content/60">Join our community of freelancers and clients</p>
            </div>

            {message && (
              <div
                className={`alert ${
                  message.includes("successful") ? "alert-success" : "alert-error"
                } mb-6 shadow-lg`}
              >
                {message.includes("successful") ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">First Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your first name"
                    className="input input-bordered w-full"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Last Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your last name"
                    className="input input-bordered w-full"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Email address</span>
                </label>
                <div className="input-group">
                  <span className="bg-base-300 flex items-center px-4 rounded-l-lg border-y border-l border-base-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-base-content/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="input input-bordered w-full rounded-l-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Password</span>
                </label>
                <div className="input-group">
                  <span className="bg-base-300 flex items-center px-4 rounded-l-lg border-y border-l border-base-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-base-content/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    type="password"
                    placeholder="Create a secure password"
                    className="input input-bordered w-full rounded-l-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <label className="label">
                  <span className="label-text-alt text-base-content/60">Password must be at least 6 characters</span>
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">I want to join as</span>
                </label>
                <div className="grid grid-cols-2 gap-4 mt-1">
                  <label className={`border rounded-lg p-4 cursor-pointer flex flex-col items-center text-center transition-all duration-200 ${role === "freelancer" ? "border-primary bg-primary/10" : "border-base-300 hover:border-base-400"}`}>
                    <input 
                      type="radio" 
                      name="role" 
                      className="radio radio-primary hidden" 
                      value="freelancer"
                      checked={role === "freelancer"}
                      onChange={(e) => setRole(e.target.value)}
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 mb-2 ${role === "freelancer" ? "text-primary" : "text-base-content/60"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium">Freelancer</span>
                    <span className="text-xs mt-1">Offer my services</span>
                  </label>
                  
                  <label className={`border rounded-lg p-4 cursor-pointer flex flex-col items-center text-center transition-all duration-200 ${role === "client" ? "border-primary bg-primary/10" : "border-base-300 hover:border-base-400"}`}>
                    <input 
                      type="radio" 
                      name="role" 
                      className="radio radio-primary hidden" 
                      value="client"
                      checked={role === "client"}
                      onChange={(e) => setRole(e.target.value)}
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 mb-2 ${role === "client" ? "text-primary" : "text-base-content/60"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="font-medium">Client</span>
                    <span className="text-xs mt-1">Hire for a project</span>
                  </label>
                </div>
              </div>

              <div className="form-control mt-4">
                <label className="label cursor-pointer justify-start gap-3">
                  <input type="checkbox" className="checkbox checkbox-primary checkbox-sm" required />
                  <span className="label-text">
                    I agree to the <Link to="/terms" className="link link-primary">Terms of Service</Link> and <Link to="/privacy" className="link link-primary">Privacy Policy</Link>
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full mt-4"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    <span className="ml-2">Creating account...</span>
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <p className="text-center text-base-content/70 mt-6">
              Already have an account?{" "}
              <Link to="/login" className="link link-primary font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
