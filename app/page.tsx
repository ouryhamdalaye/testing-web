import { Suspense } from 'react'
import TicketList from '../components/TicketList'
import CreateTicketForm from '../components/CreateTicketForm'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create and manage support tickets for your inquiries
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Ticket Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Create New Ticket
              </h2>
              <CreateTicketForm />
            </div>
          </div>

          {/* Ticket List Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Tickets
              </h2>
              <div className="space-y-4">
                <Suspense
                  fallback={
                    <div className="animate-pulse space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="bg-gray-100 rounded-lg p-4 h-24"
                        />
                      ))}
                    </div>
                  }
                >
                  <TicketList />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
