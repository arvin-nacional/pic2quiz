import { ImageUpscaler } from "@/components/image-upscaler";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-3">
            AI Image Upscaler
          </h1>
          <p className="text-slate-600 text-lg">
            Enhance and upscale your images using advanced AI technology
          </p>
        </header>

        <div className="bg-white rounded-xl shadow-md p-6">
          <ImageUpscaler />
        </div>
      </div>
    </main>
  );
}
