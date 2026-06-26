import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-600">404</h1>
        <p className="text-xl text-gray-600 mt-4 mb-8">Página não encontrada</p>
        <Link
          to="/"
          className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          Voltar para o início
        </Link>
      </div>
    </div>
  );
}
