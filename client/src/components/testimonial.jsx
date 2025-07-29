/* eslint-disable no-unused-vars */
import { useState, useRef } from "react"
import { FaArrowLeft, FaArrowRight } from "react-icons/fa"
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'

const TestimonialsSection = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const swiperRef = useRef(null)

  const testimonials = [
    {
      id: 1,
      rating: 5,
      text: "Emma kijkt elke dag uit naar onze Luumilo-tijd. Ze heeft geleerd om haar boosheid beter te uiten en is veel bewuster van haar emoties geworden. Als werkende moeder vind ik 10 minuten perfect haalbaar",
      author: "Marieke V.",
      authorRole: "Moeder van Emma (4 jaar)",
      authorInitials: "MV",
    },
    {
      id: 2,
      rating: 5,
      text: "Sinds we Luumilo gebruiken, is Liam veel rustiger geworden voor het slapengaan. Hij kan nu beter omgaan met frustratie en toont meer empathie naar zijn zusje. De oefeningen zijn simpel maar zeer effectief",
      author: "Thomas K.",
      authorRole: "Vader van Liam (5 jaar)",
      authorInitials: "TK",
    },
    {
      id: 3,
      rating: 5,
      text: "Sophie was vaak druk en had moeite met concentreren. Na 3 weken Luumilo zie ik een duidelijk verschil. Ze is bewuster van haar ademhaling en kan zichzelf beter kalmeren. Echt fantastisch!",
      author: "Linda M.",
      authorRole: "Moeder van Sophie (6 jaar)",
      authorInitials: "LM",
    },
    {
      id: 4,
      rating: 5,
      text: "Als alleenstaande vader vond ik het lastig om emotionele momenten met mijn zoon aan te gaan. Luumilo heeft ons beide tools gegeven om beter te communiceren en samen te groeien",
      author: "David R.",
      authorRole: "Vader van Noah (4 jaar)",
      authorInitials: "DR",
    },
    {
      id: 5,
      rating: 5,
      text: "Mijn dochter had vaak woedeaanvallen. Luumilo heeft haar geleerd om haar emoties te herkennen voordat ze escaleren. Nu gebruikt ze de ademhalingsoefeningen spontaan wanneer ze boos wordt",
      author: "Sarah B.",
      authorRole: "Moeder van Zoe (5 jaar)",
      authorInitials: "SB",
    },
    {
      id: 6,
      rating: 5,
      text: "Het dagelijkse ritueel met Luumilo is een hoogtepunt geworden voor ons gezin. Beide kinderen vragen er zelf naar en ik zie hoe ze de technieken ook buiten deze momenten toepassen",
      author: "Jessica W.",
      authorRole: "Moeder van Finn (4 jaar) en Mila (6 jaar)",
      authorInitials: "JW",
    }
  ]

  const profileImages = [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
    
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face",
  ]

  const nextTestimonial = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slideNext()
    }
  }

  const prevTestimonial = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slidePrev()
    }
  }

  const handleSlideChange = (swiper) => {
    setCurrentTestimonial(swiper.activeIndex)
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        className={`w-5 h-5 ${index < rating ? "text-yellow-400" : "text-gray-300"}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))
  }

  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8 -z-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <svg className="w-6 h-6 text-[#2D60EB] mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-[#000000]  inter-tight-400 text-sm uppercase tracking-wide">TESTIMONIALS</span>
          </div>
          <h2 className="text-4xl md:text-5xl poppins-700 text-gray-900 mb-4">Wat zeggen testouders?</h2>
          <p className="text-[#666666] text-md max-w-2xl mx-auto">
          Echte ervaringen van families die al met Luumilo bezig zijn          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
          <div className="lg:col-span-2 bg-[#EDF4F9] rounded-2xl p-12 text-center">
            <div className="mb-8">
              <div className="text-8xl inter-tight-700 text-[#404040] mb-4">4.9</div>
              <div className="flex justify-center mb-3">{renderStars(5)}</div>
              <p className="text-[#6E6E6E] inter-tight-400 text-base">( 40+ Reviews )</p>
            </div>

            <div className="flex justify-center">
              <div className="flex -space-x-2">
                {profileImages.map((image, index) => (
                  <img
                    key={index}
                    src={image || "/placeholder.svg"}
                    alt={`Reviewer ${index + 1}`}
                    className="w-10 h-10 rounded-full  object-cover"
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <Swiper
              ref={swiperRef}
              modules={[Navigation]}
              spaceBetween={0}
              slidesPerView={1}
              onSlideChange={handleSlideChange}
              loop={true}
              className="testimonial-swiper"
            >
              {testimonials.map((testimonial, index) => (
                <SwiperSlide key={testimonial.id}>
                  <div className="space-y-6">
                    <div className="text-[#2563EB] inter-tight-400 text-sm ">⭐ Testouder sinds week 1</div>

                    <div className="flex">{renderStars(testimonial.rating)}</div>

                    <blockquote className="text-[#6E6E6E] text-sm leading-relaxed">
                      "{testimonial.text}"
                    </blockquote>

                    <div className="flex items-center justify-between pt-4">
                      <div className="flex items-center">
                        <div className="w-14 h-14 bg-[#3B82F6] rounded-full flex items-center justify-center text-white  text-md poppins-700 mr-4">
                          {testimonial.authorInitials}
                        </div>
                        <div>
                          <div className="inter-tight-700 text-gray-900 text-md">{testimonial.author}</div>
                          <div className="text-[#000000] text-sm inter-tight-400">{testimonial.authorRole}</div>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <button
                          onClick={prevTestimonial}
                          className="w-12 h-12 bg-[#000000] rounded-lg cursor-pointer flex items-center justify-center text-white hover:bg-gray-800 transition-colors"
                        >
                         <FaArrowLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={nextTestimonial}
                          className="w-12 h-12 bg-[#000000] rounded-lg cursor-pointer flex items-center justify-center text-white hover:bg-gray-800 transition-colors"
                        >
                            <FaArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection