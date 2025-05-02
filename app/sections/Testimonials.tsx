import Link from "next/link";
import Image from "next/image";

export default function(){
    return(
        <section className="bg-blue-50 py-16 md:py-24 relative">
        {/* Background blur effect for seamless transition */}
        <div className="absolute inset-0 bg-gradient-to-b from-white to-blue-50 opacity-70 pointer-events-none"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Trusted by Industry Leaders</h2>
            <p className="max-w-2xl mx-auto text-xl text-gray-600">
              See what our clients have to say about our logistics services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Testimonial 1 - FIXED */}
            <div className="bg-white p-8 rounded-lg shadow-md relative overflow-hidden group">
              {/* Background effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="flex items-center mb-6 relative z-10">
                <div className="mr-4 w-12 h-12 rounded-full overflow-hidden">
                  <Image 
                    src="/testimonial-1.jpg" 
                    alt="Sarah Johnson" 
                    className="h-full w-full object-cover"
                    width={48}
                    height={48}
                  />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Sarah Johnson</h4>
                  <p className="text-gray-600">CEO, TechNova Inc.</p>
                </div>
              </div>
              <p className="text-gray-600 italic relative z-10">
                Obscurium Logistics transformed our supply chain operations. Their innovative approach has reduced our delivery times by 35% and improved customer satisfaction significantly.
              </p>
            </div>

            {/* Testimonial 2 - FIXED */}
            <div className="bg-white p-8 rounded-lg shadow-md relative overflow-hidden group">
              {/* Background effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="flex items-center mb-6 relative z-10">
                <div className="mr-4 w-12 h-12 rounded-full overflow-hidden">
                  <Image 
                    src="/testimonial-2.jpg" 
                    alt="Michael Chen" 
                    className="h-full w-full object-cover"
                    width={48}
                    height={48}
                  />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Michael Chen</h4>
                  <p className="text-gray-600">Operations Director, Global Trade Ltd.</p>
                </div>
              </div>
              <p className="text-gray-600 italic relative z-10">
                Working with Obscurium has been a game-changer for our international shipping needs. Their attention to detail and cutting-edge technology provides us with complete visibility across our entire supply chain.
              </p>
            </div>
          </div>
        </div>
      </section>
    )
}