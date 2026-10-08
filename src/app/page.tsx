import { Landing } from "@/components/landing";
import { defaultNiche } from "@/niches";

export default function Home() {
  return <Landing niche={defaultNiche} />;
}
