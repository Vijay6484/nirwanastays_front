import StatusPage from "@/components/PaymentSuccess";

export default function Page({ params }: { params: { status: string; id: string } }) {
  return <StatusPage status={params.status} id={params.id} />;
}

