import React from 'react'

const Specs = () => {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#F1F6FB] max-w-7xl m-auto mt-10 rounded-3xl">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-4xl sm:text-5xl font-bold text-[#2563EB] mb-2">94%</h3>
              <p className="text-[#666666] text-sm inter-tight-400">
                van kinderen toont
                <br />
                verbetering in emotionele
                <br />
                intelligentie
              </p>
            </div>
            <div>
              <h3 className="text-4xl sm:text-5xl font-bold text-[#22C55E] mb-2">80%</h3>
              <p className="text-[#666666] text-sm inter-tight-400">
                ervaart sterkere ouder-kind
                <br />
                band
              </p>
            </div>
            <div>
              <h3 className="text-4xl sm:text-5xl font-bold text-[#8B5CF6] mb-2">10 min</h3>
              <p className="text-[#666666] text-sm inter-tight-400">
                gemiddelde tijd
                <br />
                per activiteit
              </p>
            </div>
          </div>
        </div>
      </section>
  )
}

export default Specs