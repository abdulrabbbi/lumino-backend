import LoaderOverlay from '../components/LoaderOverlay';
import useProfile from '../hooks/useProfile';

export default function ProfileForm() {
  const { profile, loading } = useProfile();

  return (
    <>
    {loading && <LoaderOverlay />}
    <div className="h-full bg-[#FFFFFF] flex items-center justify-center">
      <div className="w-full max-w-4xl bg-white rounded-lg border border-[#E2E4E9] p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label htmlFor="firstName" className="block text-sm text-[#000000] inter-tight-400">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              value={profile.firstName || ''}
              readOnly
              className="w-full px-3 py-2 border border-[#F0F1F4] rounded-lg text-sm bg-[#FBFCFD] placeholder-gray-400 outline-none inter-tight-400"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="surname" className="block text-sm text-[#000000] inter-tight-400">
              Surname
            </label>
            <input
              type="text"
              id="surname"
              value={profile.surname || ''}
              readOnly
              className="w-full px-3 py-2 border border-[#F0F1F4] rounded-lg text-sm bg-[#FBFCFD] placeholder-gray-400 outline-none inter-tight-400"
              />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm text-[#000000] inter-tight-400">
              E-Mail
            </label>
            <input
              type="email"
              id="email"
              value={profile.email || ''}
              readOnly
              className="w-full px-3 py-2 border border-[#F0F1F4] rounded-lg text-sm bg-[#FBFCFD] placeholder-gray-400 outline-none inter-tight-400"
              />
          </div>

          <div className="space-y-2">
            <label htmlFor="memberSince" className="block text-sm text-[#000000] inter-tight-400">
              Member Since
            </label>
            <input
              type="text"
              id="memberSince"
              value={profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : ''}
              readOnly
              className="w-full px-3 py-2 border border-[#F0F1F4] rounded-lg text-sm bg-[#FBFCFD] placeholder-gray-400 outline-none inter-tight-400"
            />
          </div>
        </div>

        <div className="text-sm text-[#737373] inter-tight-400 leading-relaxed">
          Profile Information Is Managed Through Your Login Provider. To Update This Information, Go To Your Account
          Settings With The Provider.
        </div>
      </div>
    </div>
              </>
  );
}
