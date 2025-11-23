import { AccommodationBookingWrapper } from "@/components/AccommodationBookingPage";
import { fetchAccommodations } from "@/data";
import { SEOConfigs } from "@/utils/seo";
import { Metadata } from "next";

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const accommodations = await fetchAccommodations();
  const accommodation = accommodations.find((acc) => acc.id === params.id);

  if (!accommodation) {
    return {
      title: "Accommodation Not Found - Nirwana Stays",
      description: "The requested accommodation could not be found.",
    };
  }

  const seo = SEOConfigs.accommodation(accommodation);

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: {
      title: seo.title,
      description: seo.description,
      images: [accommodation.image],
    },
  };
}

export default function Page({ params }: Props) {
  return <AccommodationBookingWrapper id={params.id} />;
}
