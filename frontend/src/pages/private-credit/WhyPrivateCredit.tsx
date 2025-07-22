import yieldCurveImage from "@/assets/inverted-yield-curve-desktop.png";

export default function WhyPrivateCredit() {
  return (
    <section className="bg-[#f5f3f0] py-24">
      <div className="max-w-4xl mx-auto text-center px-6 space-y-6 mb-20">
        <p className="uppercase tracking-wide text-sm text-gray-500 font-medium">
          Why Private Credit
        </p>
        <h2 className="text-4xl md:text-5xl font-atlantix text-gray-900">
          A once-in-a-decade lending environment
        </h2>
        <p className="text-gray-700 text-lg leading-relaxed">
          The Federal Reserve raised interest rates at record-breaking speeds in 2023 in an attempt to tame inflation. This policy shift has destabilized markets, leading to broad dislocations, increased strain across the system, and a potential liquidity crisis that presents a risk to the global economy.
        </p>
        <p className="text-gray-700 text-lg leading-relaxed">
          Simultaneously, those factors have combined to create what we believe is arguably the most attractive environment for credit investments in a generation.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-start">
        {/* Left Column: Text */}
        <div className="space-y-6">
          <h3 className="text-2xl md:text-3xl font-sectra text-gray-900">
            What is private credit?
          </h3>
          <p className="text-gray-700 text-base leading-relaxed">
            Private credit (or private lending) is an asset class that consists generally of loans, fixed-income, or other structured investments that aim to deliver higher yields with lower overall risk when compared to equity investments. In other words, investors in private credit are lending money to borrowers in exchange for a fixed rate of return (often captured in the form of an interest rate or preferred return) but typically do not have any equity ownership or upside participation.
          </p>
          <p className="text-gray-700 text-base leading-relaxed">
            Similar to other private market assets, private credit differs from publicly traded credit or fixed-income investments, such as bonds or asset-backed securities, because it is illiquid and consequently aims to deliver a higher relative return.
          </p>

          <h3 className="text-2xl md:text-3xl font-sectra text-gray-900">
            The profitability of preparation
          </h3>
          <p className="text-gray-700 text-base leading-relaxed">
            As a result of the Fed's extraordinary actions, today it's more expensive to borrow money for 30 days than for 30 years. This is an unnatural state of affairs that we believe is creating a once-in-a-decade liquidity crunch that we're calling The Great Deleveraging.
          </p>
          <p className="text-gray-700 text-base leading-relaxed">
            During this period, individuals and companies seeking to borrow money, especially in the near term, will be forced to do so at significantly more favorable terms for investors. Higher interest rates will generally mean that borrowers will borrow at much lower leverage (which means lower risk). Virtually any loan maturing in 2023 will require a paydown, and for new loans the gap between the expected and actual proceeds will likely require the use of “bridge” or “mezzanine” financing.
          </p>
          <p className="text-gray-700 text-base leading-relaxed">
            Meanwhile, investors who have been diligent and chose to maintain larger cash positions over the past few years will be in the enviable position of being able to demand significantly more return in exchange for providing liquidity during what we expect is likely to be a temporary period of realignment. Fundrise is in that position.
          </p>
          <p className="text-gray-700 text-base leading-relaxed">
            Important Note: In our experience, these types of unique investing environments are short-lived. Accordingly, our expectation is that the current period of disruption is unlikely to last beyond 2024.
          </p>
        </div>

        {/* Right Column: Sticky Chart Image */}
        <div className="sticky top-32 ">
          <img
            src={yieldCurveImage}
            alt="Inverted yield curve chart"
            className="rounded-sm w-full h-auto object-cover"
          />
        </div>
      </div>
    </section>
  );
}
