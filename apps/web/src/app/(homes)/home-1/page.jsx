import dynamic from "next/dynamic";
import HomeMain from "@/components/home";

export const metadata = {
  title: 'Landing Page',
  description:
    'RentUp - Main Landing Page',
}

const index = () => {
  return (
    <>
      <HomeMain />
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });