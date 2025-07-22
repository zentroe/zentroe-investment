
export default function VentureAdvantage() {
  return (
    <section className="w-full bg-white px-4 py-30">
      <div className="max-w-6xl mx-auto text-center mb-16">
        <p className="text-sm uppercase tracking-widest text-gray-500 mb-7">
          The Zentroe Difference
        </p>
        <h2 className="text-3xl md:text-5xl font-sectra text-darkPrimary mb-8">
          Founders and engineers
        </h2>
        <p className="text-gray-600 font-[300] max-w-3xl mx-auto text-xl">
          With growth equity investing, it’s harder to participate in blue-chip private
          funding rounds than it is to identify the blue-chip companies. However, we
          believe Zentroe has a distinct advantage in the crowded space of venture funding.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 text-left">
        {/* Card 1 */}
        <div>
          <h3 className="font-semibold text-darkPrimary text-2xl mb-2 border-b border-gray-300 pb-2">
            Technical expertise
          </h3>
          <p className="text-md font-[300] text-gray-700 mb-4">
            Our decades of first-hand experience building and operating tech companies
            gives us a deep understanding of the daily challenges and trade-offs a growing company faces.
            With over 100 software engineers and product managers on staff, we have more software depth
            and expertise than most venture funds.
          </p>
          {/* <Link to="#" className="text-sm text-primary font-medium inline-flex items-center gap-1 hover:underline">
            Learn more about our technology <ArrowRight size={14} />
          </Link> */}
        </div>

        {/* Card 2 */}
        <div>
          <h3 className="font-semibold text-darkPrimary text-2xl mb-2 border-b border-gray-300 pb-2">
            Extensive reach
          </h3>
          <p className="text-md font-[300] text-gray-700">
            As the largest direct-to-investor alternative asset manager in the country,
            we offer portfolio companies in-app exposure to nearly 2 million people—many of whom work in tech.
            This drives brand recognition, recruiting, revenue, and critical name recognition for IPO.
          </p>
        </div>

        {/* Card 3 */}
        <div>
          <h3 className="font-semibold text-darkPrimary text-2xl mb-2 border-b border-gray-300 pb-2">
            Patient and passive capital
          </h3>
          <p className="text-md font-[300] text-gray-700">
            We’ve engineered our investment infrastructure to enable us to be the most patient and passive
            source of capital on the market, eliminating any incentive to meddle with a founder/CEO’s
            long-term vision for the sake of short-term optics or profits.
          </p>
        </div>
      </div>
    </section>
  );
}
