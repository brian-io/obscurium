import Link from "next/link";
import Image from "next/image";

export default function CTA(){
    return(
        <section className="py-16 md:py-24 relative lg:h-[600px]">
        {/* Background transition */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500 to-blue-900 opacity-50 pointer-events-none"></div>
        <div className="relative z-10 px-6 py-12 md:p-12 lg:p-16">
          <div className="max-w-7xl  mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            {/* Text Content */}
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to transform your logistics?
              </h2>
              <p className="text-xl text-blue-100 mb-8 md:mb-0">
                Get in touch with our team today and discover how Obscurium can revolutionize your supply chain.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <Link
                  href="/contact"
                  className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Contact Us
                </Link>
                <Link
                  href="/demo"
                  className="inline-flex justify-center items-center px-6 py-3 border border-white text-base font-medium rounded-md shadow-sm text-white bg-transparent hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Request Demo
                </Link>
              </div>
            </div>

            {/* SVG Image */}
            <div className="flex justify-center md:justify-end">
              <Image
                src="/images/cta-illustration.svg"
                alt="Logistics Illustration"
                className="w-full max-w-md md:h-[400px]"
                width={550}
                height={400}
              />
            </div>

          </div>
        </div>
      </section>
    )
}