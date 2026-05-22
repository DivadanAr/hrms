import DetailPenggajianPage from "@/components/penggajian/detail/data-table-penggajian-detail";

export default function KomponenGaji() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="overflow-x-auto rounded-t-xl rounded-b-md"></div>
        <DetailPenggajianPage />
      </div>
    </div>
  );
}
