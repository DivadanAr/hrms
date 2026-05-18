import IzinTable from "@/components/izin/data-table-izin";

export default function Karyawan() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="overflow-x-auto rounded-t-xl rounded-b-md">
          <IzinTable />
        </div>
      </div>
    </div>
  );
}
