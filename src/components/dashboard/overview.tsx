"use client";

import { useEffect, useState } from "react";
import {
  BadgeDollarSign,
  Briefcase,
  Building2,
  CalendarClock,
  Save,
  Timer,
  UserCheck,
  Users,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ToastContainer, useToast } from "@/components/toast";

type DashboardType = {
  total_karyawan: number;
  total_departemen: number;
  total_jabatan: number;
  total_hadir_hari_ini: number;
  total_terlambat_hari_ini: number;
  total_penggajian: number;
};

type BarChartType = {
  bulan: string;
  hadir: number;
  tidak_hadir: number;
};

type DonutChartType = {
  tepat_waktu: number;
  terlambat: number;
};

type LineChartType = {
  bulan: string;
  persen_kehadiran: number;
};

type AbsensiSettingType = {
  id: number;
  normal_jam_masuk: string;
  normal_jam_pulang: string;
};

const DONUT_COLORS = ["#10b981", "#f59e0b"];

export default function DashboardOverview() {
  const [dashboard, setDashboard] = useState<DashboardType | null>(null);
  const [barData, setBarData] = useState<BarChartType[]>([]);
  const [donutData, setDonutData] = useState<DonutChartType | null>(null);
  const [lineData, setLineData] = useState<LineChartType[]>([]);
  const [setting, setSetting] = useState<AbsensiSettingType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast, toasts, removeToast } = useToast();

  const year = new Date().getFullYear();

  const getDashboard = async () => {
    try {
      const res = await fetch("/api/dashboard");
      const result = await res.json();
      if (result.success) setDashboard(result.data);
    } catch {
      toast.error("Gagal mengambil dashboard");
    }
  };

  const getBarChart = async () => {
    try {
      const res = await fetch(`/api/dashboard/chart?tahun=${year}`);
      const result = await res.json();
      if (result.success) setBarData(result.data);
    } catch {
      toast.error("Gagal mengambil chart hadir");
    }
  };

  const getDonutChart = async () => {
    try {
      const res = await fetch(
        `/api/dashboard/chart-keterlambatan?tahun=${year}`,
      );
      const result = await res.json();
      if (result.success) setDonutData(result.data);
    } catch {
      toast.error("Gagal mengambil chart keterlambatan");
    }
  };

  const getLineChart = async () => {
    try {
      const res = await fetch(`/api/dashboard/chart-tren?tahun=${year}`);
      const result = await res.json();
      if (result.success) setLineData(result.data);
    } catch {
      toast.error("Gagal mengambil chart tren");
    }
  };

  const getSetting = async () => {
    try {
      const res = await fetch("/api/absensi-setting");
      const result = await res.json();
      if (result.success) setSetting(result.data[0]);
    } catch {
      toast.error("Gagal mengambil setting");
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([
        getDashboard(),
        getBarChart(),
        getDonutChart(),
        getLineChart(),
        getSetting(),
      ]);
      setLoading(false);
    };
    init();
  }, []);

  const handleSaveSetting = async () => {
    try {
      if (!setting) return;
      setSaving(true);
      const res = await fetch("/api/absensi-setting", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(setting),
      });
      const result = await res.json();
      result.success
        ? toast.success(result.message)
        : toast.error(result.message);
    } catch {
      toast.error("Terjadi kesalahan server");
    } finally {
      setSaving(false);
    }
  };

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);

  const donutPieData = donutData
    ? [
        { name: "Tepat Waktu", value: donutData.tepat_waktu },
        { name: "Terlambat", value: donutData.terlambat },
      ]
    : [];

  const totalDonut = donutPieData.reduce((sum, d) => sum + d.value, 0);

  return (
    <>
      <div className="p-4 md:p-6 space-y-6">
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Dashboard HRMS
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Overview perusahaan dan statistik absensi
          </p>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
            {[
              {
                label: "Total Karyawan",
                value: dashboard?.total_karyawan ?? 0,
                icon: Users,
                bg: "bg-blue-100",
                color: "text-blue-600",
              },
              {
                label: "Total Departemen",
                value: dashboard?.total_departemen ?? 0,
                icon: Building2,
                bg: "bg-emerald-100",
                color: "text-emerald-600",
              },
              {
                label: "Total Jabatan",
                value: dashboard?.total_jabatan ?? 0,
                icon: Briefcase,
                bg: "bg-purple-100",
                color: "text-purple-600",
              },
              {
                label: "Total Penggajian",
                value: dashboard?.total_penggajian ?? 0,
                icon: BadgeDollarSign,
                bg: "bg-red-100",
                color: "text-red-600",
                rupiah: true,
              },
            ].map(({ label, value, icon: Icon, bg, color, rupiah }) => (
              <div
                key={label}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{label}</p>
                    <h2
                      className={`font-bold text-gray-900 mt-2 ${rupiah ? "text-2xl" : "text-3xl"}`}
                    >
                      {loading ? "-" : rupiah ? formatRupiah(value) : value}
                    </h2>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}
                  >
                    <Icon size={22} className={color} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-1 gap-5">
            {/* SETTING */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <CalendarClock size={20} className="text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">
                    Setting Absensi
                  </h2>
                  <p className="text-sm text-gray-500">Jam kerja normal</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700">
                  Jam Masuk
                </label>
                <input
                  type="time"
                  step="1"
                  value={setting?.normal_jam_masuk?.slice(0, 8) || ""}
                  onChange={(e) =>
                    setSetting((prev) =>
                      prev
                        ? { ...prev, normal_jam_masuk: e.target.value }
                        : null,
                    )
                  }
                  className="mt-2 w-full h-11 px-3 rounded-xl border border-gray-200 text-sm text-gray-700"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Jam Pulang
                </label>
                <input
                  type="time"
                  step="1"
                  value={setting?.normal_jam_pulang?.slice(0, 8) || ""}
                  onChange={(e) =>
                    setSetting((prev) =>
                      prev
                        ? { ...prev, normal_jam_pulang: e.target.value }
                        : null,
                    )
                  }
                  className="mt-2 w-full h-11 px-3 rounded-xl border border-gray-200 text-sm text-gray-700"
                />
              </div>

              <button
                onClick={handleSaveSetting}
                disabled={saving}
                className="mt-6 w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium inline-flex items-center justify-center gap-2"
              >
                <Save size={16} />
                {saving ? "Menyimpan..." : "Simpan Setting"}
              </button>
            </div>
          </div>
        </div>

        {/* ROW 1: Bar Chart + Donut Chart */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* LINE CHART — Tren Kehadiran */}
          <div className="xl:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <h2 className="text-base font-semibold text-gray-900">
              Tren Kehadiran
            </h2>
            <p className="text-sm text-gray-500 mt-0.5 mb-4">
              Persentase kehadiran per bulan tahun {year}
            </p>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bulan" tick={{ fontSize: 12 }} />
                  <YAxis
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fontSize: 12 }}
                  />
                  {/* <Tooltip
                    formatter={(value: number) => [`${value}%`, "Kehadiran"]}
                  /> */}
                  <Line
                    type="monotone"
                    dataKey="persen_kehadiran"
                    name="% Kehadiran"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#6366f1" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* DONUT CHART — Tepat Waktu vs Terlambat */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <h2 className="text-base font-semibold text-gray-900">
              Keterlambatan
            </h2>
            <p className="text-sm text-gray-500 mt-0.5 mb-4">
              Tepat waktu vs terlambat tahun {year}
            </p>
            <div className="h-[220px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {donutPieData.map((_, i) => (
                      <Cell key={i} fill={DONUT_COLORS[i]} />
                    ))}
                  </Pie>
                  {/* <Tooltip
                    formatter={(value: number) => [`${value} orang`, ""]}
                  /> */}
                </PieChart>
              </ResponsiveContainer>
              {/* Label tengah donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-gray-900">
                  {totalDonut}
                </span>
                <span className="text-xs text-gray-500">Total</span>
              </div>
            </div>
            {/* Legend manual */}
            <div className="flex flex-col gap-2 mt-3">
              {donutPieData.map((d, i) => (
                <div
                  key={d.name}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full inline-block"
                      style={{ background: DONUT_COLORS[i] }}
                    />
                    <span className="text-gray-600">{d.name}</span>
                  </div>
                  <span className="font-semibold text-gray-800">
                    {totalDonut > 0
                      ? `${Math.round((d.value / totalDonut) * 100)}%`
                      : "0%"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ROW 2: Line Chart + Setting */}
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
