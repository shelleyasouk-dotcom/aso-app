import { ExternalLink, CheckCircle } from 'lucide-react'
import { PortalLayout } from '../../components/layout/PortalLayout'

const CLASSES_URL = 'https://activeschool.classforkids.io'

export function PortalClassesPage() {
  return (
    <PortalLayout>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a3a6b] to-[#1e4a8c] py-16 px-4 text-white text-center">
        <div className="max-w-xl mx-auto">
          <div className="text-5xl mb-4">🤸</div>
          <h1 className="text-3xl font-extrabold mb-3">Book a Gymnastics Class</h1>
          <p className="text-white/70 text-base leading-relaxed mb-8">
            All our classes are booked through ClassForKids — a secure, easy-to-use booking system used by half a million parents across the UK.
          </p>
          <a
            href={CLASSES_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#f5c518] text-[#1a3a6b] font-extrabold text-lg px-8 py-4 rounded-2xl hover:bg-yellow-400 transition-colors shadow-lg"
          >
            Find & Book a Class <ExternalLink size={18} />
          </a>
          <p className="text-white/40 text-xs mt-4">Opens ClassForKids — activeschool.classforkids.io</p>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-2xl mx-auto px-4 py-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">How to book in 3 steps</h2>
        <div className="flex flex-col gap-4">
          {[
            { step: '1', title: 'Find your class', desc: 'Browse by location and day. Each class shows availability, times and prices.' },
            { step: '2', title: 'Create your account', desc: 'Set up a free ClassForKids account — your details are saved for all future bookings.' },
            { step: '3', title: 'Pay securely online', desc: 'Book and pay in minutes. You\'ll get an instant confirmation by email.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex items-start gap-4 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="w-9 h-9 bg-[#1a3a6b] rounded-full flex items-center justify-center shrink-0">
                <span className="text-white font-extrabold text-sm">{step}</span>
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm mb-0.5">{title}</p>
                <p className="text-xs text-gray-500 leading-snug">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-gray-50 border-t border-gray-100 py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-lg font-bold text-gray-900 mb-5 text-center">Why we use ClassForKids</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              'Book anytime, anywhere, on any device',
              'Your details saved for future bookings',
              'Instant booking confirmation by email',
              'Secure online payments',
              'Easy to manage and view your bookings',
              'Trusted by 500,000+ parents across the UK',
            ].map(text => (
              <div key={text} className="flex items-start gap-3 bg-white border border-gray-100 rounded-xl p-4">
                <CheckCircle size={15} className="text-green-600 shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700 leading-snug">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA footer */}
      <section className="py-12 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <p className="text-gray-500 text-sm mb-5">Ready to get started? All classes are on ClassForKids.</p>
          <a
            href={CLASSES_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#1a3a6b] text-white font-bold px-8 py-3.5 rounded-xl hover:bg-[#142f58] transition-colors"
          >
            Go to ClassForKids <ExternalLink size={15} />
          </a>
          <p className="text-xs text-gray-400 mt-3">
            Already have an account?{' '}
            <a href="https://bookings.class4kids.co.uk/dashboard" target="_blank" rel="noopener noreferrer" className="text-[#1a3a6b] font-semibold hover:underline">
              Log in to manage your bookings
            </a>
          </p>
        </div>
      </section>

    </PortalLayout>
  )
}
