import { CreatePartyForm } from './components/CreatePartyForm';

export default function App() {
  return (
    <main className="min-h-screen brand-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-6 brand-gradient rounded-full" />
          <h1 className="text-xl font-semibold text-gray-900">Create party</h1>
        </div>
        <CreatePartyForm />
      </div>
    </main>
  );
}
