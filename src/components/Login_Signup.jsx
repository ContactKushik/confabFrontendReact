import React, { useState } from "react";
import { useForm } from "react-hook-form";

const Login_Signup = () => {
  const [isLogin, setIsLogin] = useState(true);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const toggleForm = () => {
    reset(); // Reset form when toggling
    setIsLogin(!isLogin);
  };

  const onSubmit = (data) => {
    console.log(data);
    reset(); // Reset the form after submission
  };

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-gray-900 text-gray-100 relative">
      {/* Image Section */}
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
          <h1 className="text-2xl font-bold mb-4 text-center">
            {isLogin ? "Welcome Back!" : "Create an Account"}
          </h1>
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
            {!isLogin && (
              <>
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
              </>
            )}
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
            {!isLogin && (
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
            )}

            <button
              type="submit"
            //   disabled={!isLogin && password !== confirmPassword}
              className={`w-full ${
                
                  "bg-blue-500 hover:bg-blue-400"
              } text-white font-bold py-2 rounded transition`}
            >
              {isLogin ? "Login" : "Sign Up"}
            </button>
          </form>
          <p className="mt-4 text-sm text-center">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={toggleForm}
              className="text-blue-400 hover:underline focus:outline-none"
            >
              {isLogin ? "Sign Up" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login_Signup;
