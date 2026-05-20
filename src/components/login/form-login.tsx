"use client";

import Link from "next/link";
import { Eye, Leaf, LockKeyhole, Mail } from "lucide-react";
import {
  isIOS,
  osVersion,
  isIOS13,
  isMobile,
  getUA,
  browserVersion,
  browserName,
  deviceDetect,
  fullBrowserVersion,
} from 'react-device-detect';


export default function FormLogin() {
    return (
        <div className="flex items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="mb-10 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50">
                <Leaf size={34} className="text-emerald-600" />
              </div>
            </div>

            {/* Heading */}
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800">Welcome Back</h1>

              <p className="mt-4 text-gray-500">
                isMobile - {JSON.stringify(isMobile)}
                <br />
                Login to continue using the website. Please complete your credentials below
              </p>
            </div>

            {/* Form */}
            <form className="mt-10 space-y-5">
              {/* Email */}
              <div className="relative">
                <Mail
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="email"
                  placeholder="Email"
                  className="h-14 w-full rounded-2xl border border-gray-200 bg-white pl-12 pr-4 outline-none transition-all focus:border-emerald-500 text-gray-600"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <LockKeyhole
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="password"
                  placeholder="Password"
                  className="h-14 w-full rounded-2xl border border-gray-200 bg-white pl-12 pr-12 outline-none transition-all focus:border-emerald-500 text-gray-600"
                />

                <Eye
                  size={20}
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400"
                />
              </div>

              {/* Remember */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-500">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                  />
                  Remember Me
                </label>

                <Link href="#" className="text-sm font-medium text-emerald-600">
                  Forgot Password?
                </Link>
              </div>

              {/* Button */}
              <button className="h-14 w-full rounded-2xl bg-emerald-500 font-semibold text-white transition-all hover:bg-emerald-600">
                Login
              </button>
            </form>
            <div className="h-20"></div>
          </div>
        </div>
    )
}