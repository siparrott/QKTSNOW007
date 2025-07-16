import SEOHead from '@/components/seo-head';
import { Link } from 'wouter';

export default function Home() {
  return (
    <>
      <SEOHead
        title="QuoteKits – AI Quote Calculators for Service Businesses"
        description="AI-powered instant quote calculators that convert visitors into paying clients. 5-minute setup. No coding. Just bookings."
        url="https://www.quotekits.com/"
        keywords="quote calculator, AI quotes, service pricing, automated quotes, pricing calculator, lead generation, business quotes, instant pricing"
      />

      <main className="max-w-5xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-center">
          💥 They Don't Want a Chat. They Want a Price.
        </h1>

        <p className="mt-4 text-lg text-center">
          Clients don't want to call. They won't wait for an email.  
          <strong>They want a price — right now.</strong>
        </p>

        <p className="mt-4 text-center">
          If your website can't quote instantly, they'll click away and never return.  
          It's not your fault. Your service page just isn't built to convert.  
          <strong>But now it can be.</strong>
        </p>

        <div className="bg-yellow-100 p-6 rounded-lg text-center mt-8">
          <h2 className="text-2xl font-bold">💥 Get Lifetime Access for Just €5/month</h2>
          <p className="mt-2">Limited Launch Offer • Renews annually • Cancel anytime</p>
          <Link
            href="/register"
            className="mt-4 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Get QuoteKit Now →
          </Link>
        </div>

        <section className="mt-12">
          <h2 className="text-2xl font-bold">😫 Before: The Back-and-Forth Burnout</h2>
          <ul className="list-disc ml-6 mt-4">
            <li>A potential client sends a vague message</li>
            <li>You write a custom quote… then wait</li>
            <li>Crickets. No reply. No booking. Another wasted hour</li>
          </ul>
          <p className="mt-4">
            Meanwhile, your competitor sent a sleek, automated quote in 3 seconds flat.  
            <strong>They won the client. You lost time.</strong>
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-bold">🚀 After: From Ghosted to Booked</h2>
          <p className="mt-4">
            With <strong>QuoteKit.ai</strong>, your site delivers exactly what they want:
          </p>
          <ul className="list-disc ml-6 mt-4">
            <li>Instant pricing</li>
            <li>Beautiful quote PDFs</li>
            <li>Email lead capture</li>
          </ul>
          <p className="mt-4">
            All in less time than it takes to answer a DM. You become the pro they trust — before you even reply.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-bold">🛠️ The Fix: Our AI-Powered Quote Engine</h2>
          <ol className="list-decimal ml-6 mt-4">
            <li>Choose from 50+ calculators (photographers, trades, events & more)</li>
            <li>Customize your style, logo & pricing — no code needed</li>
            <li>Embed & watch quotes + leads roll in, 24/7</li>
          </ol>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-bold">Your Arsenal of Quote-to-Close Power Moves</h2>
          <p className="mt-4">Build trust. Get booked. Look like a pro. No coding. No wasted DMs.</p>
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold">📸 Photographers</h3>
              <p>Wedding, portrait, event calculators</p>
              <Link href="/portrait-photography-calculator" className="text-blue-600 underline hover:text-blue-800">Try Calculator</Link>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold">💪 Fitness & Wellness</h3>
              <p>Personal training, wellness services</p>
              <Link href="/personal-training-calculator" className="text-blue-600 underline hover:text-blue-800">Try Calculator</Link>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold">🏡 Home Services</h3>
              <p>Landscaping, cleaning, renovation</p>
              <Link href="/home-renovation-calculator-new" className="text-blue-600 underline hover:text-blue-800">Try Calculator</Link>
            </div>
          </div>
        </section>

        <section className="mt-12 text-center">
          <h2 className="text-2xl font-bold">🎯 Ready to Give Your Leads What They Want?</h2>
          <p className="mt-4">Stop quoting by hand. Start closing with QuoteKit.</p>
          <Link
            href="/register"
            className="mt-4 inline-block bg-green-600 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-green-700 transition-colors"
          >
            💥 Get QuoteKit Now →
          </Link>
        </section>
      </main>
    </>
  );
}
