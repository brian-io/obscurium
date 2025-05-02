import Link from "next/link";
import Image from "next/image";

export default function(){
    return(
<section className="py-16 md:py-24 relative">
        {/* Background design element for seamless transition */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-100 to-white opacity-50 pointer-events-none"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose Obscurium Logistics</h2>
            <p className="max-w-2xl mx-auto text-xl text-gray-600">
              Trusted by leading companies worldwide for our innovative approach to logistics management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-blue-100 p-8 h-60 shadow-md transition-transform duration-300 hover:transform hover:scale-105">
              <div className="text-blue-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Fast & Efficient Delivery</h3>
              <p className="text-gray-600">
                Our optimized logistics network ensures your shipments reach their destination on time, every time.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-blue-100 p-8 shadow-md transition-transform duration-300 hover:transform hover:scale-105">
              <div className="text-blue-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Secure & Trackable</h3>
              <p className="text-gray-600">
                Real-time tracking and advanced security protocols to protect your valuable shipments.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-blue-100 p-8 shadow-md transition-transform duration-300 hover:transform hover:scale-105">
              <div className="text-blue-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Cost-Effective Solutions</h3>
              <p className="text-gray-600">
                Optimize your logistics spend with our data-driven approach to supply chain management.
              </p>
            </div>
          </div>
        </div>
      </section>
    )
}