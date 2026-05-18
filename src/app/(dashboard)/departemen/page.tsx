import DepartemenTable from "@/components/departemen/data-table-departemen";
import Link from "next/link";

export default function Departemen() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white shadow-sm">
        <div className="overflow-x-auto rounded-t-xl rounded-b-md">
          <DepartemenTable />
        </div>
      </div>
    </div>
  );
}
