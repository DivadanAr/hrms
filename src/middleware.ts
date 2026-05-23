import { NextRequest, NextResponse } from "next/server";
import { getCookie } from "./context/cookie";

// Hanya HR yang boleh akses
const HR_ONLY_ROUTES = [
  "/departemen",
  "/jabatan",
  "/karyawan",
  "/izin",
  "/lembur",
  "/absensi",
];

// Hanya FINANCE yang boleh akses
const FINANCE_ONLY_ROUTES = [
  "/komponen-gaji",
  "/pengalokasian-gaji",
  "/penggajian",
];

// Semua route yang butuh login (non-mobile)
const ADMIN_ROUTES = [...HR_ONLY_ROUTES, ...FINANCE_ONLY_ROUTES, "/"];

function matchesRoutes(path: string, routes: string[]): boolean {
  return routes.some((route) => path === route || path.startsWith(`${route}/`));
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get("__vxu_KeySid")?.value;

  // Belum login → redirect ke login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const userDataRaw = await getCookie("__vxu_meta-Us");
  let role = "";
  let device = "";

  if (userDataRaw) {
    try {
      const parsed = JSON.parse(userDataRaw);
      role = parsed?.role ?? "";
      device = parsed?.device ?? "";
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  const isMobileRoute = path.startsWith("/mobile");

  // Jika device desktop → tidak boleh akses /mobile
  if (device === "desktop" && isMobileRoute) {
    return NextResponse.rewrite(new URL("/forbidden", request.url));
  }

  // Jika device bukan desktop → hanya boleh akses /mobile
  if (device !== "desktop" && !isMobileRoute) {
    return NextResponse.rewrite(new URL("/forbidden", request.url));
  }

  // Logika role hanya berlaku untuk non-mobile (device desktop)
  // HR tidak boleh akses route finance
  if (role === "HR" && matchesRoutes(path, FINANCE_ONLY_ROUTES)) {
    return NextResponse.rewrite(new URL("/forbidden", request.url));
  }

  // FINANCE tidak boleh akses route HR
  if (role === "FINANCE" && matchesRoutes(path, HR_ONLY_ROUTES)) {
    return NextResponse.rewrite(new URL("/forbidden", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|login|forbidden|not-found).*)"],
};
// import { NextRequest, NextResponse } from "next/server";
// import { getCookie } from "./context/cookie";

// // Route khusus HR
// const HR_ONLY_ROUTES = [
//   "/departemen",
//   "/jabatan",
//   "/karyawan",
//   "/izin",
//   "/lembur",
//   "/absensi",
// ];

// // Route khusus FINANCE
// const FINANCE_ONLY_ROUTES = [
//   "/komponen-gaji",
//   "/pengalokasian-gaji",
//   "/penggajian",
// ];

// function matchesRoutes(path: string, routes: string[]): boolean {
//   return routes.some((route) => path === route || path.startsWith(`${route}/`));
// }

// export async function middleware(request: NextRequest) {
//   const path = request.nextUrl.pathname;

//   // skip asset
//   if (
//     path.startsWith("/_next") ||
//     path.startsWith("/api") ||
//     path.startsWith("/favicon.ico") ||
//     path.startsWith("/sw.js")
//   ) {
//     return NextResponse.next();
//   }

//   const token = request.cookies.get("__vxu_KeySid")?.value;

//   // belum login
//   if (!token) {
//     if (path !== "/login") {
//       return NextResponse.redirect(new URL("/login", request.url));
//     }

//     return NextResponse.next();
//   }

//   // sudah login tapi buka login
//   if (path === "/login") {
//     return NextResponse.redirect(new URL("/", request.url));
//   }

//   const userDataRaw = await getCookie("__vxu_meta-Us");

//   let role = "";

//   if (userDataRaw) {
//     try {
//       const parsed = JSON.parse(userDataRaw);
//       role = parsed?.role ?? "";
//     } catch {
//       return NextResponse.redirect(new URL("/login", request.url));
//     }
//   }

//   // =====================================================
//   // EMPLOYEE
//   // hanya tidak boleh akses admin
//   // =====================================================

//   if (role === "EMPLOYEE") {
//     const blockedForEmployee = [...HR_ONLY_ROUTES, ...FINANCE_ONLY_ROUTES];

//     if (matchesRoutes(path, blockedForEmployee)) {
//       return NextResponse.rewrite(new URL("/forbidden", request.url));
//     }

//     return NextResponse.next();
//   }

//   // =====================================================
//   // HR tidak boleh akses finance
//   // =====================================================

//   if (role === "HR" && matchesRoutes(path, FINANCE_ONLY_ROUTES)) {
//     return NextResponse.rewrite(new URL("/forbidden", request.url));
//   }

//   // =====================================================
//   // FINANCE tidak boleh akses HR
//   // =====================================================

//   if (role === "FINANCE" && matchesRoutes(path, HR_ONLY_ROUTES)) {
//     return NextResponse.rewrite(new URL("/forbidden", request.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/((?!api|_next/static|_next/image).*)"],
// };
