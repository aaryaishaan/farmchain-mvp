import type React from "react"
import { Link } from "react-router-dom"
import { Leaf, Shield, Users, QrCode } from "lucide-react"

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Leaf className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">FarmChain</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="btn-outline">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-accent-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Track Your Food's Journey
              <span className="block text-primary-600">From Farm to Table</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              FarmChain provides complete transparency in agricultural supply chains. Scan QR codes to see exactly where
              your food comes from and how it traveled to you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary text-lg px-8 py-3">
                Start Tracking
              </Link>
              <Link to="/scanner" className="btn-outline text-lg px-8 py-3">
                Scan QR Code
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Complete Supply Chain Visibility</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Every step of your produce's journey is recorded and verified on the blockchain
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Farm Origin</h3>
              <p className="text-gray-600">
                Know exactly which farm your produce comes from, including harvest dates and growing conditions.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-accent-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-accent-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Supply Chain</h3>
              <p className="text-gray-600">
                Track every handler from distributor to retailer with timestamps and locations.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Blockchain Verified</h3>
              <p className="text-gray-600">
                All data is secured and verified on the blockchain for complete transparency.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-accent-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <QrCode className="h-8 w-8 text-accent-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">QR Code Access</h3>
              <p className="text-gray-600">Simply scan the QR code on any product to see its complete journey.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Supply Chain?</h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join farmers, distributors, and retailers who are already using FarmChain to build trust with their
            customers.
          </p>
          <Link
            to="/register"
            className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-md transition-colors"
          >
            Get Started Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <Leaf className="h-6 w-6 text-primary-400" />
            <span className="ml-2 text-lg font-semibold">FarmChain</span>
          </div>
          <p className="text-center text-gray-400 mt-4">© 2025 FarmChain. Building trust in food supply chains.</p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
