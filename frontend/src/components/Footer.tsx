interface Props {
  teamName?: string;
}

export default function Footer({ teamName }: Props) {
  return (
    <footer className="bg-gray-900 text-gray-400 py-8 px-4 text-center text-sm">
      <p>&copy; {new Date().getFullYear()} {teamName || 'Time BCR'}. Todos os direitos reservados.</p>
    </footer>
  );
}
