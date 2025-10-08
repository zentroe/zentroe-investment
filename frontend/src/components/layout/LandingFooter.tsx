// src/components/LandingFooter.tsx
// import { motion } from "framer-motion";
import zenLogoDark from "@/assets/zenLogoDark.png";
import { FaLinkedin, FaInstagram, FaXTwitter } from "react-icons/fa6";

export default function LandingFooter() {
  return (
    <footer className="bg-[#090702] text-muted-foreground pt-16 pb-8 text-sm">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-4 gap-12">

        {/* Column 1: Logo and Contact */}
        <div className="space-y-6">
          <img src={zenLogoDark} alt="Zentroe Logo" className="h-10" />
          <div>
            <p>10 Market Street</p>
            <p>London, United Kingdom</p>
          </div>
          <p>Contact us</p>
          <div className="flex gap-4 text-white">
            <a href="#"><FaLinkedin size={20} /></a>
            <a href="#"><FaInstagram size={20} /></a>
            <a href="#"><FaXTwitter size={20} /></a>
          </div>
        </div>

        {/* Column 2: Invest */}
        <div className="space-y-4">
          <h4 className="text-white font-semibold mb-4">Invest</h4>
          <ul className="space-y-2">
            <li><a href="/real-estate">Real Estate</a></li>
            <li><a href="/private-credit">Private Credit</a></li>
            <li><a href="/venture">Venture</a></li>
          </ul>
        </div>

        {/* Column 3: Resources */}
        <div className="space-y-4">
          <h4 className="text-white font-semibold mb-4">Resources</h4>
          <ul className="space-y-2">
            <li><a href="#">Why Zentroe</a></li>
            <li><a href="#">How it Works</a></li>
            <li><a href="#">Help Center</a></li>
            <li><a href="#">Articles</a></li>
          </ul>
        </div>

        {/* Column 4: Company */}
        <div className="space-y-4">
          <h4 className="text-white font-semibold mb-4">Company</h4>
          <ul className="space-y-2">
            <li><a href="/about">About Us</a></li>
            <li><a href="#">Press</a></li>
            <li><a href="#">Careers</a></li>
          </ul>
        </div>

      </div>

      {/* Bottom legal/disclaimer */}
      <div className="mt-12 px-4 max-w-6xl mx-auto text-left text-[11px] text-muted-foreground leading-relaxed">
        <p>Zentroe reserves the right to change or terminate offers at its sole discretion. Past performance is not indicative of future results. All investments carry risk including loss of principal.</p>
        <p className="mt-2">Any third party ratings reflect solely the opinions of the authors, do not reflect the views of Zentroe, and Zentroe does not independently certify the information contained therein. Any such content is meant for informational purposes only and is not intended to serve as a recommendation to buy or sell any security, and is not an offer or sale of any security, and is not intended to serve as the basis for any investment decision. Past performance is not indicative of future results, and all investments may result in total or partial loss.
        </p>
        <p className="mt-2"><span className="font-semibold">Investopedia</span> Zentroe received a 4.7-star rating from Investopedia in January 2024. This recognition was based on an analysis of 19 platforms throughout 2023, evaluating criteria such as investment options, fees, transparency, and other features. No compensation was exchanged for this rating. The author is not a client of Zentroe. Investopedia receives cash compensation for referring potential clients to Zentroe via advertisements placed on their respective websites.
        </p>
        <p className="mt-2">
          <span className="font-semibold">Nerdwallet</span> Zentroe received a 5-star rating from Nerdwallet in December 2023 for a review period of October - December 2023. The rating is based on over 15 factors, including account fees and minimums, investment choices, customer support, and mobile app capabilities. Zentroe replied to a Nerdwallet questionnaire that was used in the rating of this award. No compensation was exchanged for this rating. The author is not a client of Zentroe. Nerdwallet receives cash compensation for referring potential clients to Zentroe via advertisements placed on their respective websites
        </p>
        <p className="mt-2">© 2025 Zentroe, LLC. All Rights Reserved</p>
      </div>
    </footer>
  );
}
