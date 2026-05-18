"use client";

import { useEffect, useState } from "react";
import { X, Pencil, Loader2, Eye, EyeOff } from "lucide-react";

type KaryawanType = {
  id_karyawan: number;
  nama: string;
  jenis_kelamin: "L" | "P";
  alamat: string | null;
  nip: string;
  no_rek: string | null;
  no_telp: string | null;

  id_user: number;
  email: string;
  role: string;

  status: string;

  tanggal_masuk: string;
  tanggal_keluar: string | null;

  id_departemen: number;
  nama_departemen: string;

  id_jabatan: number;
  nama_jabatan: string;
};

type JabatanType = { id_jabatan: number; nama_jabatan: string };
type DepartemenType = { id_departemen: number; nama_departemen: string };

type Props = {
  isOpen: boolean;
  data: KaryawanType | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
};

type FormType = {
  nama: string;
  email: string;
  password: string;
  nip: string;
  jenis_kelamin: string;
  alamat: string;
  no_rek: string;
  no_telp: string;
  status: string;
  tanggal_masuk: string;
  tanggal_keluar: string;
  id_jabatan: string;
  id_departemen: string;
};

type FieldErrors = Partial<Record<keyof FormType, string>>;

export default function ModalEditKaryawan({
  isOpen,
  data,
  onClose,
  onSuccess,
  onError,
}: Props) {
  const [form, setForm] = useState<FormType>({
    nama: "",
    email: "",
    password: "",
    nip: "",
    jenis_kelamin: "",
    alamat: "",
    no_rek: "",
    no_telp: "",
    status: "aktif",
    tanggal_masuk: "",
    tanggal_keluar: "",
    id_jabatan: "",
    id_departemen: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [jabatanList, setJabatanList] = useState<JabatanType[]>([]);
  const [departemenList, setDepartemenList] = useState<DepartemenType[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchOptions = async () => {
      try {
        const [jRes, dRes] = await Promise.all([
          fetch("/api/jabatan"),
          fetch("/api/departemen"),
        ]);

        const jabatanResult = await jRes.json();
        const departemenResult = await dRes.json();

        setJabatanList(jabatanResult.data || []);
        setDepartemenList(departemenResult.data || []);
      } catch (e) {
        console.log(e);

        setJabatanList([]);
        setDepartemenList([]);
      }
    };

    fetchOptions();
  }, [isOpen]);

  useEffect(() => {
    if (data) {
      setForm({
        nama: data.nama ?? "",
        email: data.email ?? "",
        password: "",
        nip: data.nip ?? "",
        jenis_kelamin: data.jenis_kelamin ?? "",
        alamat: data.alamat ?? "",
        no_rek: data.no_rek ?? "",
        no_telp: data.no_telp ?? "",
        status: data.status ?? "aktif",
        tanggal_masuk: data.tanggal_masuk
          ? data.tanggal_masuk.slice(0, 10)
          : "",
        tanggal_keluar: data.tanggal_keluar
          ? data.tanggal_keluar.slice(0, 10)
          : "",
        id_jabatan: data.id_jabatan ? String(data.id_jabatan) : "",
        id_departemen: data.id_departemen ? String(data.id_departemen) : "",
      });
    }
  }, [data]);

  const set = (field: keyof FormType, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
  };

  const validate = () => {
    const e: FieldErrors = {};
    if (!form.nama.trim()) e.nama = "Nama wajib diisi.";
    if (!form.email.trim()) e.email = "Email wajib diisi.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Format email tidak valid.";
    if (form.password && form.password.length < 6)
      e.password = "Password minimal 6 karakter.";
    if (!form.nip.trim()) e.nip = "NIP wajib diisi.";
    if (!form.jenis_kelamin) e.jenis_kelamin = "Jenis kelamin wajib dipilih.";
    if (!form.tanggal_masuk) e.tanggal_masuk = "Tanggal masuk wajib diisi.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        ...form,
        id_jabatan: form.id_jabatan ? Number(form.id_jabatan) : null,
        id_departemen: form.id_departemen ? Number(form.id_departemen) : null,
      };
      if (!form.password) delete payload.password;

      const res = await fetch(`/api/karyawan/${data?.id_karyawan}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      handleClose();
      onSuccess("Data karyawan berhasil diperbarui.");
    } catch {
      onError("Gagal memperbarui data karyawan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setErrors({});
    setShowPassword(false);
    onClose();
  };

  if (!isOpen || !data) return null;

  const inputClass = (field: keyof FormType) =>
    `w-full h-9 px-3 text-sm rounded-lg border outline-none transition-colors bg-white text-gray-800 placeholder-gray-400 disabled:opacity-60 disabled:cursor-not-allowed ${
      errors[field]
        ? "border-red-300 focus:border-red-400"
        : "border-gray-200 focus:border-blue-400"
    }`;

  const selectClass = (field: keyof FormType) =>
    `w-full h-9 px-3 text-sm rounded-lg border outline-none transition-colors bg-white text-gray-800 disabled:opacity-60 disabled:cursor-not-allowed ${
      errors[field]
        ? "border-red-300 focus:border-red-400"
        : "border-gray-200 focus:border-blue-400"
    }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-2xl mx-4 bg-white rounded-xl shadow-xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Pencil size={15} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-900">
                Edit Karyawan
              </h2>
              <p className="text-xs text-gray-400">
                Perbarui data karyawan. Kosongkan password jika tidak ingin
                mengubah.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 overflow-y-auto space-y-5 flex-1">
          {/* Akun */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Akun
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  placeholder="contoh@email.com"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  disabled={loading}
                  className={inputClass("email")}
                />
                {errors.email && (
                  <p className="text-[11px] text-red-500">{errors.email}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">
                  Password{" "}
                  <span className="text-gray-400 font-normal">
                    (opsional — kosongkan jika tidak diubah)
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••"
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    disabled={loading}
                    className={`${inputClass("password")} pr-9`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-red-500">{errors.password}</p>
                )}
              </div>
            </div>
          </div>

          {/* Data Pribadi */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Data Pribadi
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">
                  Nama Lengkap <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nama lengkap karyawan"
                  value={form.nama}
                  onChange={(e) => set("nama", e.target.value)}
                  disabled={loading}
                  className={inputClass("nama")}
                />
                {errors.nama && (
                  <p className="text-[11px] text-red-500">{errors.nama}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">
                  NIP <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nomor Induk Pegawai"
                  value={form.nip}
                  onChange={(e) => set("nip", e.target.value)}
                  disabled={loading}
                  className={inputClass("nip")}
                />
                {errors.nip && (
                  <p className="text-[11px] text-red-500">{errors.nip}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">
                  Jenis Kelamin <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.jenis_kelamin}
                  onChange={(e) => set("jenis_kelamin", e.target.value)}
                  disabled={loading}
                  className={selectClass("jenis_kelamin")}
                >
                  <option value="">Pilih jenis kelamin</option>
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
                {errors.jenis_kelamin && (
                  <p className="text-[11px] text-red-500">
                    {errors.jenis_kelamin}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">
                  No. Telepon{" "}
                  <span className="text-gray-400 font-normal">(opsional)</span>
                </label>
                <input
                  type="text"
                  placeholder="08xxxxxxxxxx"
                  value={form.no_telp}
                  onChange={(e) => set("no_telp", e.target.value)}
                  disabled={loading}
                  className={inputClass("no_telp")}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">
                  No. Rekening{" "}
                  <span className="text-gray-400 font-normal">(opsional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Nomor rekening bank"
                  value={form.no_rek}
                  onChange={(e) => set("no_rek", e.target.value)}
                  disabled={loading}
                  className={inputClass("no_rek")}
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <label className="text-xs font-medium text-gray-600">
                  Alamat{" "}
                  <span className="text-gray-400 font-normal">(opsional)</span>
                </label>
                <textarea
                  placeholder="Alamat lengkap karyawan"
                  value={form.alamat}
                  onChange={(e) => set("alamat", e.target.value)}
                  disabled={loading}
                  rows={2}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-blue-400 outline-none transition-colors bg-white text-gray-800 placeholder-gray-400 resize-none disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          {/* Kepegawaian */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Kepegawaian
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">
                  Jabatan{" "}
                  <span className="text-gray-400 font-normal">(opsional)</span>
                </label>
                <select
                  value={form.id_jabatan}
                  onChange={(e) => set("id_jabatan", e.target.value)}
                  disabled={loading}
                  className={selectClass("id_jabatan")}
                >
                  <option value="">Pilih jabatan</option>
                  {jabatanList.map((j) => (
                    <option key={j.id_jabatan} value={j.id_jabatan}>
                      {j.nama_jabatan}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">
                  Departemen{" "}
                  <span className="text-gray-400 font-normal">(opsional)</span>
                </label>
                <select
                  value={form.id_departemen}
                  onChange={(e) => set("id_departemen", e.target.value)}
                  disabled={loading}
                  className={selectClass("id_departemen")}
                >
                  <option value="">Pilih departemen</option>
                  {departemenList.map((d) => (
                    <option key={d.id_departemen} value={d.id_departemen}>
                      {d.nama_departemen}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">
                  Status <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.status}
                  onChange={(e) => set("status", e.target.value)}
                  disabled={loading}
                  className={selectClass("status")}
                >
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                  <option value="resign">Resign</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">
                  Tanggal Masuk <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={form.tanggal_masuk}
                  onChange={(e) => set("tanggal_masuk", e.target.value)}
                  disabled={loading}
                  className={inputClass("tanggal_masuk")}
                />
                {errors.tanggal_masuk && (
                  <p className="text-[11px] text-red-500">
                    {errors.tanggal_masuk}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">
                  Tanggal Keluar{" "}
                  <span className="text-gray-400 font-normal">(opsional)</span>
                </label>
                <input
                  type="date"
                  value={form.tanggal_keluar}
                  onChange={(e) => set("tanggal_keluar", e.target.value)}
                  disabled={loading}
                  className={inputClass("tanggal_keluar")}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={handleClose}
            disabled={loading}
            className="h-9 px-4 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 active:scale-95 transition-all duration-150 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center gap-2 h-9 px-4 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 active:scale-95 rounded-lg transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan Perubahan"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
