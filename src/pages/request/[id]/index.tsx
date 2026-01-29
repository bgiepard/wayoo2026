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

  // Przekierowanie w zaleznosci od statusu
  let destination = `/request/${id}/offers`;

  if (["accepted", "paid", "completed"].includes(status)) {
    destination = `/request/${id}/payment`;
  }

  return {
    redirect: {
      destination,
      permanent: false,
    },
  };
};
