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

  // Zawsze przekieruj na stronę ofert (accepted/completed też tam trafiają)
  const destination = `/request/${id}/offers`;

  return {
    redirect: {
      destination,
      permanent: false,
    },
  };
};
