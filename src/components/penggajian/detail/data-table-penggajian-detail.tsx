"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgeDollarSign,
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  ReceiptText,
  User2,
  Wallet,
  TimerReset,
  ShieldAlert,
  CalendarCheck2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";

type DetailPenggajianType = {
  id_penggajian: number;
  periode: string;
  nama_komponen_gaji: string;
  tipe: "pendapatan" | "potongan";
  nominal: string;
  keterangan: string;
};

type PenggajianType = {
  id_penggajian: number;
  id_karyawan: number;
  nama_karyawan: string;
  nip: string;
  nama_jabatan: string;
  periode: string;
  total_pendapatan: string;
  total_potongan: string;
  gaji_bersih: string;
};

type ResponseType = {
  success: boolean;
  data_detail_penggajian: DetailPenggajianType[];
  data_penggajian: PenggajianType[];

  jumlah_izin: number;
  jumlah_jam_lembur: number;
  jumlah_hari_kerja: number;
  jumlah_kehadiran: number;
};

export default function DetailPenggajianPage() {
  const router = useRouter();
  const params = useParams();

  const [loading, setLoading] = useState(true);

  const [detail, setDetail] = useState<DetailPenggajianType[]>([]);
  const [header, setHeader] = useState<PenggajianType | null>(null);

  const [jumlahIzin, setJumlahIzin] = useState(0);
  const [jumlahJamLembur, setJumlahJamLembur] = useState(0);
  const [jumlahHariKerja, setJumlahHariKerja] = useState(0);
  const [jumlahKehadiran, setJumlahKehadiran] = useState(0);

  const formatRupiah = (nominal: number | string) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(nominal));
  };

  const getData = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/penggajian/${params.id}`);
      const result: ResponseType = await res.json();

      if (result.success) {
        setDetail(result.data_detail_penggajian);
        setHeader(result.data_penggajian[0]);

        setJumlahIzin(result.jumlah_izin);
        setJumlahJamLembur(result.jumlah_jam_lembur);
        setJumlahHariKerja(result.jumlah_hari_kerja);
        setJumlahKehadiran(result.jumlah_kehadiran);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const pendapatan = useMemo(() => {
    return detail.filter((item) => item.tipe === "pendapatan");
  }, [detail]);

  const potongan = useMemo(() => {
    return detail.filter((item) => item.tipe === "potongan");
  }, [detail]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-[500px]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Memuat detail penggajian...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!header) return null;

  return (
    <div className="space-y-6 min-h-screen">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-600 transition-all mb-3"
          >
            <ArrowLeft size={16} />
            Kembali
          </button>

          <h1 className="text-2xl font-bold text-gray-900">
            Detail Penggajian
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Informasi lengkap penggajian karyawan
          </p>
        </div>
      </div>

      {/* HERO */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 p-7 text-white shadow-lg">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-24 translate-x-16" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-sm mb-4">
              <Wallet size={15} />
              Payroll Summary
            </div>

            <h2 className="text-3xl font-bold">{header.nama_karyawan}</h2>

            <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-emerald-50">
              <span>{header.nip}</span>
              <span>•</span>
              <span>{header.nama_jabatan}</span>
              <span>•</span>
              <span>Periode {header.periode}</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-2xl px-6 py-5 min-w-[280px]">
            <p className="text-sm text-emerald-50">Take Home Pay</p>

            <h1 className="text-4xl font-bold mt-2">
              {formatRupiah(header.gaji_bersih)}
            </h1>

            <div className="grid grid-cols-2 gap-3 mt-5">
              <div>
                <p className="text-xs text-emerald-100">Pendapatan</p>

                <p className="font-semibold">
                  {formatRupiah(header.total_pendapatan)}
                </p>
              </div>

              <div>
                <p className="text-xs text-emerald-100">Potongan</p>

                <p className="font-semibold">
                  {formatRupiah(header.total_potongan)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STATISTIC */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Hari Kerja</p>

              <h2 className="text-3xl font-bold text-gray-900 mt-2">
                {jumlahHariKerja}
              </h2>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
              <CalendarDays size={22} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Kehadiran</p>

              <h2 className="text-3xl font-bold text-gray-900 mt-2">
                {jumlahKehadiran}
              </h2>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CalendarCheck2 size={22} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Lembur</p>

              <h2 className="text-3xl font-bold text-gray-900 mt-2">
                {jumlahJamLembur} Jam
              </h2>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600">
              <Clock3 size={22} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Izin Diterima</p>

              <h2 className="text-3xl font-bold text-gray-900 mt-2">
                {jumlahIzin}
              </h2>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-500">
              <TimerReset size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* DETAIL */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* PENDAPATAN */}
        <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-gray-100 bg-emerald-50">
            <div className="flex items-center gap-2">
              <BadgeDollarSign size={18} className="text-emerald-600" />

              <h2 className="font-semibold text-emerald-700">Pendapatan</h2>
            </div>
          </div>

          <div className="divide-y divide-gray-50">
            {pendapatan.map((item, index) => (
              <div
                key={index}
                className="p-5 flex items-start justify-between gap-4 hover:bg-gray-50 transition-all"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {item.nama_komponen_gaji}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    {item.keterangan}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600">
                    + {formatRupiah(item.nominal)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* POTONGAN */}
        <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-gray-100 bg-red-50">
            <div className="flex items-center gap-2">
              <ShieldAlert size={18} className="text-red-500" />

              <h2 className="font-semibold text-red-600">Potongan</h2>
            </div>
          </div>

          <div className="divide-y divide-gray-50">
            {potongan.map((item, index) => (
              <div
                key={index}
                className="p-5 flex items-start justify-between gap-4 hover:bg-gray-50 transition-all"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {item.nama_komponen_gaji}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    {item.keterangan}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold text-red-500">
                    - {formatRupiah(item.nominal)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
