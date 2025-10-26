import Link from "next/link";
import Image from "next/image";

export default function Hero(){
    return(
        <section className="relative overflow-hidden pt-16 md:pt-20 lg:pt-16">
          <div className="container mx-auto  px-4 sm:px-6 lg:px-8 ">
            <div className="grid grid-cols-1 h-screen lg:grid-cols-2 gap-1 items-center">
              <div className="max-w-2xl items-center">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                  Redefining Logistics for the Digital Age
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  Streamline your supply chain with Obscurium&apos;s innovative logistics solutions. We leverage cutting-edge technology to optimize your logistics operations and drive business growth.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/consultation" className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-900 hover:bg-blue-950 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Get a Free Consultation
                  </Link>
                  <Link href="/solutions" className="inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm bg-gradient-to-r text-gray-700 from-teal-300 to-blue-300 hover:from-teal-400 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Explore Solutions
                  </Link>
                </div>
              </div>
              <div className="hidden lg:block ">
                {/* Hero image */}
                <div className="relative">
                  <div className="absolute inset-0 z-0"></div>
                  <div className="relative w-full overflow-hidden rounded-2xl">
                    <Image 
                      src="/images/logistics-hero.jpg" 
                      alt="Logistics operations" 
                      className="w-full lg:h-[600px] object-cover "
                      width={600}
                      height={650}
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
      </section>
    )
}