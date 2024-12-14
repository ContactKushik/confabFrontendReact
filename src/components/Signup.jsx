import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from "../utils/toast";
import { RiLoader4Line } from "react-icons/ri"; // Importing the spinner icon from remix icon

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // State to manage loading
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const { username, email, password } = data;
    setLoading(true); // Set loading to true when the request starts

    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/auth/register`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const result = await response.json();
      const { success, message, error } = result;
      if (success) {
        handleSuccess(message);
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      } else if (error) {
        const details = error?.details[0].message;
        handleError(details);
        return;
      } else if (!success) {
        handleError(message);
        return;
      }
      console.log(result);
    } catch (error) {
      console.log(error);
      handleError(error);
    } finally {
      setLoading(false); // Set loading to false when the request is completed
    }

    console.log({ username, email, password });
    reset(); // Reset the form after successful submission
  };

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-gray-900 text-gray-100 relative">
      {/* Image Section */}
      <ToastContainer />
      <div
        className="absolute lg:static inset-0 bg-cover bg-center lg:w-1/2"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1733130856136-8b684753bbfe?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
        }}
      >
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-black bg-opacity-50 lg:hidden"></div>
      </div>

      {/* Form Section */}
      <div className="relative lg:w-1/2 flex justify-center items-center p-8">
        <div className="w-full max-w-md bg-gray-800 bg-opacity-90 p-8 rounded-lg shadow-lg mx-auto">
          <h1 className="text-2xl font-bold mb-4 text-center">Create an Account</h1>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label htmlFor="email" className="block mb-1 text-sm">
                Email
              </label>
              <input
                type="email"
                id="email"
                {...register("email", { required: "Email is required" })}
                className="w-full px-3 py-2 border rounded bg-gray-700 text-white"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>
            <div className="mb-4">
              <label htmlFor="username" className="block mb-1 text-sm">
                Username
              </label>
              <input
                type="text"
                id="username"
                {...register("username", {
                  required: "Username is required",
                })}
                className="w-full px-3 py-2 border rounded bg-gray-700 text-white"
                placeholder="Enter your username"
              />
              {errors.username && (
                <p className="text-red-500 text-sm">
                  {errors.username.message}
                </p>
              )}
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="block mb-1 text-sm">
                Password
              </label>
              <input
                type="password"
                id="password"
                {...register("password", { required: "Password is required" })}
                className="w-full px-3 py-2 border rounded bg-gray-700 text-white"
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="mb-4">
              <label htmlFor="confirmPassword" className="block mb-1 text-sm">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                {...register("confirmPassword", {
                  required: "Confirm Password is required",
                  validate: {
                    matches: (value) =>
                      value === password || "Passwords do not match",
                  },
                })}
                className={`w-full px-3 py-2 border rounded bg-gray-700 text-white outline-none ${
                  confirmPassword
                    ? password === confirmPassword
                      ? "border-green-500"
                      : "border-red-500"
                    : "border-gray-500"
                }`}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading} // Disable button when loading
              className={`w-full bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 rounded transition flex items-center justify-center`}
            >
              {loading && <RiLoader4Line className="animate-spin mr-2" />} {/* Spinner inside button */}
              Sign Up
            </button>
          </form>
          <p className="mt-4 text-sm text-center">
            Already have an account?{" "}
            <button
              onClick={() => navigate('/login')}
              className="text-blue-400 hover:underline focus:outline-none"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
