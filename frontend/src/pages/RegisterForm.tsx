import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BackgroundImg from "../assets/newchat.png";

const countryOptions = [
  { code: "92", name: "Pakistan" },
  { code: "1", name: "USA" },
  { code: "44", name: "UK" },
];

const pakistanCities = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Multan",
  "Peshawar",
];

export default function RegisterForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Step 1
  const [fullName, setFullName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [message, setMessage] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");


  // Step 2
  const [cnicNumber, setCnicNumber] = useState("");
  const [cnicFile, setCnicFile] = useState<File | null>(null);
  const [countryCode, setCountryCode] = useState("92");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("Pakistan");
  const [city, setCity] = useState("Karachi");
  const [dob, setDob] = useState("");
  const [educationLevel, setEducationLevel] = useState("");

  // Step 3
  const [email, setEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // OTP countdown
  useEffect(() => {
    if (otpTimer <= 0) return;
    const interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [otpTimer]);

  // CNIC format
  const handleCnicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 13);
    if (val.length > 5 && val.length <= 12)
      val = `${val.slice(0, 5)}-${val.slice(5)}`;
    if (val.length > 12)
      val = `${val.slice(0, 5)}-${val.slice(5, 12)}-${val.slice(12)}`;
    setCnicNumber(val);
  };

  // Step 1 validation
  const handleNextStep1 = () => {
    const nameRegex = /^[A-Za-z ]{3,15}$/;
    const newErrors: { [key: string]: string } = {};

    if (!fullName.trim()) newErrors.fullName = "Full Name is required";
    else if (!nameRegex.test(fullName))
      newErrors.fullName = "Full Name must be 3–15 letters only";

    if (!fatherName.trim()) newErrors.fatherName = "Father Name is required";
    else if (!nameRegex.test(fatherName))
      newErrors.fatherName = "Father Name must be 3–15 letters only";

    if (!password) newErrors.password = "Password is required";
    else if (!/^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(password))
      newErrors.password =
        "Password must have at least 6 characters with letters & numbers";

    if (!confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword)
       newErrors.confirmPassword = "Passwords do not match";


    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setStep(2);
    }
  };

  // Step 2 validation & next step
  const handleNextStep2 = async () => {
    const newErrors: { [key: string]: string } = {};

    if (!cnicNumber) newErrors.cnicNumber = "CNIC required";
    if (!cnicFile) newErrors.cnicFile = "CNIC image required";
    if (!phone) newErrors.phone = "Phone required";
    else if (!/^\d{7,15}$/.test(phone))
      newErrors.phone = "Invalid phone number";
    if (!country) newErrors.country = "Country required";
    if (!city) newErrors.city = "City required";
    if (!dob) newErrors.dob = "Date of birth required";
    if (!educationLevel) newErrors.educationLevel = "Education required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const plainCnic = cnicNumber.replace(/\D/g, "");
      await axios.post("http://localhost:5000/api/auth/check-unique", {
        cnicNumber: plainCnic,
        phone,
      });
      setErrors({});
      setStep(3);
    } catch (err) {
      setStep(3);
    }
  };

  // OTP sending
  const sendOtp = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrors({ ...errors, email: "Enter a valid email" });
      return;
    }

    setSendingOtp(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/send-otp", {
        email,
      });
      setOtpSent(true);
      setOtpTimer(60);
      setMessage(res.data.message || "OTP sent");
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  // OTP verification
  const verifyOtp = async () => {
    if (!otp) return setErrors({ ...errors, otp: "Enter OTP" });
    setVerifyingOtp(true);
    try {
      await axios.post("http://localhost:5000/api/auth/verify-otp", {
        email,
        otp,
      });
      setEmailVerified(true);
      setMessage("Email verified");
    } catch (err: any) {
      setMessage("Invalid OTP");
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Final registration → navigate to login
  const handleRegister = async () => {
    if (!emailVerified) {
      setErrors({ email: "Please verify your email first" });
      return;
    }

    try {
      const fd = new FormData();
      fd.append("fullName", fullName);
      fd.append("fatherName", fatherName);
      fd.append("email", email);
      fd.append("password", password);
      fd.append("cnicNumber", cnicNumber);
      if (cnicFile) fd.append("cnicImage", cnicFile);
      fd.append("countryCode", countryCode);
      fd.append("phone", phone);
      fd.append("country", country);
      fd.append("city", city);
      fd.append("dob", dob);
      fd.append("educationLevel", educationLevel);

      await axios.post("http://localhost:5000/api/auth/register", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Only change: navigate to login page
      navigate("/login");
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div
      className="h-screen w-full flex items-center"
      style={{
        backgroundImage: `url(${BackgroundImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >

      {/* Header */}
<header className="absolute top-4 left-0 w-full flex items-center justify-between px-8">
  {/* Left - AirGO logo */}
  <h1
    onClick={() => navigate("/")}
    className="text-2xl font-bold text-yellow-700 cursor-pointer hover:text-yellow-800 drop-shadow-md"
  >
    AirGO
  </h1>

  {/* Right - Back to Dashboard */}
  <button
    onClick={() => navigate("/")}
    className="bg-amber-500 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-amber-600 transition"
  >
    Back to Dashboard
  </button>
</header>



      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-sm ml-24">
        <h2 className="text-2xl font-bold text-center mb-4 text-yellow-700">
          Register
        </h2>
        <p className="text-center text-yellow-600 mb-6">Step {step} of 3</p>

        {/*    Step 1    */}
       
{step === 1 && (
  <div className="space-y-4">
    {/* Full Name */}
    <input
      value={fullName}
      onChange={(e) => setFullName(e.target.value)}
      placeholder="Full Name"
      className="w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-yellow-600"
    />
    {errors.fullName && (
      <p className="text-red-600 text-sm">{errors.fullName}</p>
    )}

    {/* Father Name */}
    <input
      value={fatherName}
      onChange={(e) => setFatherName(e.target.value)}
      placeholder="Father Name"
      className="w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-yellow-600"
    />
    {errors.fatherName && (
      <p className="text-red-600 text-sm">{errors.fatherName}</p>
    )}

    {/* Password */}
    <div className="relative">
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type={showPassword ? "text" : "password"}
        placeholder="Password"
        className="w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-yellow-600"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-600"
      >
        {showPassword ? "🙈" : "👁"}
      </button>
    </div>
    {errors.password && (
      <p className="text-red-600 text-sm">{errors.password}</p>
    )}

    {/* Confirm Password */}
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirm Password"
        className="w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-yellow-600"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-600"
      >
        {showPassword ? "🙈" : "👁"}
      </button>
    </div>
    {errors.confirmPassword && (
      <p className="text-red-600 text-sm">{errors.confirmPassword}</p>
    )}

    <button
      type="button"
      onClick={handleNextStep1}
      className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded"
    >
      Next →
    </button>
  </div>
)}


        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <input
              value={cnicNumber}
              onChange={handleCnicChange}
              placeholder="CNIC (XXXXX-XXXXXXX-X)"
              className="w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-yellow-600"
            />
            {errors.cnicNumber && <p className="text-red-600 text-sm">{errors.cnicNumber}</p>}

            <div className="flex gap-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="p-2 rounded border border-gray-300 focus:ring-2 focus:ring-yellow-600"
              >
                {countryOptions.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
                className="flex-1 p-3 rounded border border-gray-300 focus:ring-2 focus:ring-yellow-600"
              />
            </div>
            {errors.phone && <p className="text-red-600 text-sm">{errors.phone}</p>}

            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full p-2 rounded border border-gray-300 focus:ring-2 focus:ring-yellow-600"
            >
              {countryOptions.map((c) => (
                <option key={c.code} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            {country === "Pakistan" && (
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-2 rounded border border-gray-300 focus:ring-2 focus:ring-yellow-600"
              >
                {pakistanCities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}

            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-yellow-600"
            />

            <select
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value)}
              className="w-full p-2 rounded border border-gray-300 focus:ring-2 focus:ring-yellow-600"
            >
              <option value="">Select Education Level</option>
              <option value="High School">High School</option>
              <option value="Bachelor's">Bachelor's</option>
              <option value="Master's">Master's</option>
              <option value="PhD">PhD</option>
            </select>

            <div className="border-2 border-dashed border-gray-400 rounded-lg p-4 text-center cursor-pointer hover:border-yellow-600">
              <label className="cursor-pointer">
                {cnicFile ? <span>Selected File: {cnicFile.name}</span> : <span>Click to upload CNIC image</span>}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files) setCnicFile(e.target.files[0]);
                  }}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex justify-between mt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleNextStep2}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-4">
            <input
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailVerified(false);
                setOtpSent(false);
                setOtpTimer(0);
              }}
              placeholder="Email"
              type="email"
              className="w-full p-3 rounded border border-gray-300 focus:ring-2 focus:ring-yellow-600"
            />

            <button
              type="button"
              onClick={sendOtp}
              disabled={sendingOtp}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded"
            >
              {sendingOtp
                ? "Sending..."
                : otpSent
                ? otpTimer > 0
                  ? `Resend OTP in ${otpTimer}s`
                  : "Resend OTP"
                : "Send OTP"}
            </button>

            {otpSent && !emailVerified && (
              <div className="flex gap-2 items-center mt-2">
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  className="flex-1 p-2 rounded border border-gray-300 focus:ring-2 focus:ring-yellow-600"
                />
                <button
                  type="button"
                  onClick={verifyOtp}
                  disabled={verifyingOtp}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded"
                >
                  {verifyingOtp ? "Verifying..." : "Verify OTP"}
                </button>
              </div>
            )}

            {emailVerified && (
              <div className="text-green-700 mt-1 font-semibold">
                Email verified
              </div>
            )}

            <div className="flex justify-between mt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleRegister}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
              >
                Register
              </button>
            </div>

            {message && (
              <p className="text-center mt-2 text-sm text-yellow-700">{message}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}