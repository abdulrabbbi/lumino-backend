import { useNavigate } from "react-router-dom";
import LoaderOverlay from "../components/LoaderOverlay";
import useUserSubscription from "../hooks/useUserSubscription";

export default function SubscriptionPage() {
  const { subscription, loading } = useUserSubscription();
  const navigate = useNavigate();

  const redirectToPurchasePage = () =>{
    navigate('/pricing')
  }

  if (loading) {
    return <LoaderOverlay />;
  }

  if (!subscription?.hasSubscription) {
    return (
      <div className="flex flex-col items-center justify-center p-10 bg-white rounded-lg border border-[#E2E4E9] max-w-4xl mx-auto mt-10 space-y-4">
        <h2 className="text-xl font-semibold inter-tight-400 text-gray-900 ">
          You haven’t purchased any subscription yet
        </h2>
        <p className="text-gray-600 text-center inter-tight-400 text-sm">
          Purchase a subscription and start your activity journey!
        </p>
        <button
              className="bg-blue-500 text-sm cursor-pointer inter-tight-400 text-white px-10 py-2 rounded-xl duration-500 transition-all hover:bg-blue-600"
              onClick={redirectToPurchasePage} 
        >
          Purchase Subscription
        </button>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#FFFFFF] space-y-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg border border-[#E2E4E9] p-6 md:p-8">
          <h2 className="text-xl text-gray-950 mb-6 inter-tight-400">Subscription details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="text-sm text-gray-600 mb-1 inter-tight-400">Subscription Status</div>
              <div className="text-base font-medium text-gray-900 inter-tight-400">
                {subscription.status}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1 inter-tight-400">Package</div>
              <div className="text-base font-medium text-gray-900 inter-tight-400">
                {subscription.subscription?.name}
              </div>
            </div>
          </div>

          <hr className="border-gray-200 mb-6" />

          <div className="space-y-3">
            <button className="px-6 py-2 border border-[#8F8F8F] rounded-xl text-[#8F8F8F] cursor-pointer">
              Cancel Subscription
            </button>
            <p className="text-sm text-[#B5B5B5] inter-tight-400">
              Your subscription will remain active until the end of the current billing period.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 md:p-8">
          <h2 className="text-xl text-[#000000] mb-6 inter-tight-400">Billing History</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="text-sm text-gray-600 mb-1 inter-tight-400">Final Payment</div>
              <div className="text-base font-medium text-gray-900 inter-tight-400">
                €{subscription.subscription?.price}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1 inter-tight-400">Type</div>
              <div className="text-base font-medium text-gray-900 inter-tight-400">
                {subscription.subscription?.priceType}
              </div>
            </div>
          </div>

          <hr className="border-gray-200 mb-4" />

          <p className="text-sm text-[#B5B5B5] inter-tight-400">
            Please contact customer service for detailed billing history.
          </p>
        </div>
      </div>
    </div>
  );
}
