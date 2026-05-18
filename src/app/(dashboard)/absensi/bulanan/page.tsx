import AbsensiBulananTable from "@/components/absensi/bulanan/data-table-absensi-bulanan";

export default function AbsenBulanan() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white shadow-sm">
        <div className="overflow-x-auto rounded-t-xl rounded-b-md">
          <AbsensiBulananTable />
        </div>
      </div>
    </div>
  );
}
