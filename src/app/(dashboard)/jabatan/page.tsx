import JabatanTable from "@/components/jabatan/data-table-jabatan";

export default function Jabatan() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="overflow-x-auto rounded-t-xl rounded-b-md">
          <JabatanTable />
        </div>
      </div>
    </div>
  );
}
