import KaryawanTable from "@/components/karyawan/data-table-karyawan";

export default function Karyawan() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="overflow-x-auto rounded-t-xl rounded-b-md">
          <KaryawanTable />
        </div>
      </div>
    </div>
  );
}
