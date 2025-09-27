import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function VentureCTA() {
  return (
    <section className="w-full bg-[#0C0C0C] px-4 py-30 text-center text-white">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-6xl font-sectra mb-6 leading-tight">
          Add venture to your <br className="hidden md:block" /> portfolio
        </h2>
        <Link to="/signup">
          <Button className="bg-primary hover:bg-[#8c391e] text-white px-6 py-3 rounded-md text-sm">
            Get started
          </Button>
        </Link>
      </div>
    </section>
  );
}
