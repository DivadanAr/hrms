import DetailAbsensiKaryawan from "@/components/absensi/karyawan/data-table-absensi-perkaryawan";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AbsenHarian({ params }: Props) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white shadow-sm">
        <div className="overflow-x-auto rounded-t-xl rounded-b-md">
          <DetailAbsensiKaryawan id_karyawan={Number(id)} />
        </div>
      </div>
    </div>
  );
}
