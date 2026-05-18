import LemburTable from "@/components/lembur/data-table-lembur";

export default function Lembur() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="overflow-x-auto rounded-t-xl rounded-b-md">
          <LemburTable />
        </div>
      </div>
    </div>
  );
}
