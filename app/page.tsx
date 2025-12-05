import ModelCard from '@/components/ModelCard';
import { MentalModel } from '@/types';
import mentalModelsData from '../input.json';

export default function Home() {
  const mentalModels = mentalModelsData as MentalModel[];

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-md mx-auto sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            MindSnack
          </h1>
          <p className="text-gray-600">
            Mental Models với góc nhìn Gen Z
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentalModels.map((model, index) => (
            <ModelCard key={index} model={model} />
          ))}
        </div>
      </div>
    </main>
  );
}

