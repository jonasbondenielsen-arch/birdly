import VaelgKoder from "../../components/VaelgKoder";

export const metadata = {
  title: "Vælg dine opgaver | Birdly",
  robots: { index: false }, // privat token-side — ikke i søgeresultater
};

export default async function Page({ searchParams }) {
  const sp = await searchParams;
  return <VaelgKoder token={sp?.token || ""} />;
}
