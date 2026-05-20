"use client";

import Link from "next/link";
import {
  Eye,
  EyeOff,
  Leaf,
  LockKeyhole,
  Mail,
} from "lucide-react";

import { useState } from "react";

import { isDesktop, isIOS, isMobile } from "react-device-detect";

import { useRouter } from "next/navigation";

import {
  ToastContainer,
  useToast,
} from "../toast";

export default function FormLogin() {
  const router = useRouter();

  const { toasts, removeToast, toast } =
    useToast();

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: false,
    password: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: false,
    }));
  };

  const handleFocus = (
    name: "email" | "password"
  ) => {
    setErrors((prev) => ({
      ...prev,
      [name]: false,
    }));
  };

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    // IMPORTANT
    e.preventDefault();
    e.stopPropagation();

    const newErrors = {
      email: !form.email,
      password: !form.password,
    };

    setErrors(newErrors);

    if (!form.email || !form.password) {
      toast.error(
        "Email dan password wajib diisi"
      );

      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email: form.email,
            password: form.password,
            device: JSON.stringify(isMobile) || JSON.stringify(isIOS)
              ? "mobile"
              : "desktop",
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        toast.error(
          result.message ||
            "Login gagal"
        );

        if (
          result.message
            ?.toLowerCase()
            .includes("email")
        ) {
          setErrors((prev) => ({
            ...prev,
            email: true,
          }));
        }

        if (
          result.message
            ?.toLowerCase()
            .includes("password")
        ) {
          setErrors((prev) => ({
            ...prev,
            password: true,
          }));
        }

        return;
      }

      toast.success("Login berhasil");

      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (error) {
      console.log(error);

      toast.error(
        "Terjadi kesalahan pada server"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center px-6 py-10 sm:px-10">
        <div className="w-full max-w-md">

          {/* LOGO */}
          <div className="mb-10 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50">
              <Leaf
                size={34}
                className="text-emerald-600"
              />
            </div>
          </div>

          {/* HEADING */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800">
              Welcome Back
            </h1>

            <p className="mt-4 text-gray-500">
              {(isDesktop == true) ? `Manage attendance, payroll, employee performance and more in one dashboard.` : 'Login to continue using the website.' }
            </p>
          </div>

          {/* FORM */}
          <form
            method="POST"
            action="#"
            autoComplete="off"
            onSubmit={handleLogin}
            className="mt-10 space-y-5"
          >

            {/* EMAIL */}
            <div className="relative">
              <Mail
                size={20}
                className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                  errors.email
                    ? "text-red-400"
                    : "text-gray-400"
                }`}
              />

              <input
                type="email"
                name="email"
                autoComplete="off"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                onFocus={() =>
                  handleFocus("email")
                }
                className={`h-14 w-full rounded-2xl border bg-white pl-12 pr-4 outline-none transition-all text-gray-600

                ${
                  errors.email
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-200 focus:border-emerald-500"
                }
              `}
              />
            </div>

            {/* PASSWORD */}
            <div className="relative">
              <LockKeyhole
                size={20}
                className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                  errors.password
                    ? "text-red-400"
                    : "text-gray-400"
                }`}
              />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                autoComplete="off"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                onFocus={() =>
                  handleFocus("password")
                }
                className={`h-14 w-full rounded-2xl border bg-white pl-12 pr-12 outline-none transition-all text-gray-600

                ${
                  errors.password
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-200 focus:border-emerald-500"
                }
              `}
              />

              {/* IMPORTANT */}
              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff
                    size={20}
                    className="text-gray-400"
                  />
                ) : (
                  <Eye
                    size={20}
                    className="text-gray-400"
                  />
                )}
              </button>
            </div>

            {/* REMEMBER */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-500">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                />
                Remember Me
              </label>

              <Link
                href="#"
                className="text-sm font-medium text-emerald-600"
              >
                Forgot Password?
              </Link>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="h-14 w-full rounded-2xl bg-emerald-500 font-semibold text-white transition-all hover:bg-emerald-600 disabled:opacity-50"
            >
              {loading
                ? "Loading..."
                : "Login"}
            </button>
          </form>

          <div className="h-20"></div>
        </div>
      </div>

      {/* TOAST */}
      <ToastContainer
        toasts={toasts}
        onRemove={removeToast}
      />
    </>
  );
}