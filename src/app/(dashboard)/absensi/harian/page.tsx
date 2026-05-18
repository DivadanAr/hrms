import AbsensiHarianTable from "@/components/absensi/harian/data-table-absensi-harian";

export default function AbsenHarian() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white shadow-sm">
        <div className="overflow-x-auto rounded-t-xl rounded-b-md">
          <AbsensiHarianTable />
        </div>
      </div>
    </div>
  );
}
