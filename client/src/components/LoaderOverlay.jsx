import { ClipLoader } from "react-spinners";

export default function LoaderOverlay() {
  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-30 flex items-center justify-center z-[10000000]">
      <ClipLoader
      color="#3FDBB1"
        size={50}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
    </div>
  );
}
