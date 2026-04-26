import { GetServerSideProps } from "next";
import { getRequestById } from "@/services";

export default function RequestIndexPage() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id as string;

  const request = await getRequestById(id);

  if (!request) {
    return {
      notFound: true,
    };
  }

  const status = String(request.status || "").toLowerCase();

  // Dla zaakceptowanych i ukończonych — szczegóły transportu; pozostałe — oferty
  const destination = ["accepted", "completed"].includes(status)
    ? `/request/${id}/transport`
    : `/request/${id}/offers`;

  return {
    redirect: {
      destination,
      permanent: false,
    },
  };
};
