import { ImageUploader } from "@/components/image-uploader";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-3">
            PictureQuiz
          </h1>
          <p className="text-slate-600 text-lg">
            Upload an image and we'll generate a quiz based on its content
          </p>
        </header>

        <div className="bg-white rounded-xl shadow-md p-6">
          <ImageUploader />
        </div>
      </div>
    </main>
  );
}
