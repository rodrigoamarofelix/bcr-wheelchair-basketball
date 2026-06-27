import { useState } from 'react';

interface Props {
  email?: string;
  phone?: string;
  address?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
}

export default function Contact({ email, phone, address, instagram, facebook, youtube }: Props) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Erro ao enviar' }));
        throw new Error(err.error || 'Erro ao enviar');
      }

      setSent(true);
      form.reset();
      setTimeout(() => setSent(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar mensagem');
    }
  }

  return (
    <section id="contato" className="py-20 px-4 bg-primary-900 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid gap-12 xl:grid-cols-[1.1fr_0.9fr] items-start">
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 text-white text-sm uppercase tracking-[0.24em] mb-4">
              Fale conosco
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Vamos construir o próximo jogo juntos</h2>
            <p className="text-gray-200 max-w-2xl leading-relaxed mb-8">
              Entre em contato para se tornar parceiro, apoiar o time ou acompanhar as próximas partidas. Estamos prontos para fazer parte da sua história.
            </p>
            <div className="space-y-6 text-primary-100">
              {email && (
                <p className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </span>
                  <span>{email}</span>
                </p>
              )}
              {phone && (
                <p className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </span>
                  <span>{phone}</span>
                </p>
              )}
              {address && (
                <p className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </span>
                  <span>{address}</span>
                </p>
              )}
            </div>
            {(instagram || facebook || youtube) && (
              <div className="mt-10">
                <h3 className="text-xl font-semibold mb-4">Siga-nos nas Redes Sociais</h3>
                <div className="flex flex-wrap gap-4">
                  {instagram && (
                    <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                      className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/15">
                      Instagram
                    </a>
                  )}
                  {facebook && (
                    <a href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                      className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/15">
                      Facebook
                    </a>
                  )}
                  {youtube && (
                    <a href={youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube"
                      className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/15">
                      YouTube
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-8 shadow-2xl shadow-black/20">
            <h3 className="text-2xl font-bold mb-4 text-white">Enviar mensagem</h3>
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
              <div>
                <label htmlFor="contact-name" className="sr-only">Seu nome</label>
                <input id="contact-name" name="name" type="text" placeholder="Seu nome" required autoComplete="name"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
              </div>
              <div>
                <label htmlFor="contact-email" className="sr-only">Seu email</label>
                <input id="contact-email" name="email" type="email" placeholder="Seu email" required autoComplete="email"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
              </div>
              <div>
                <label htmlFor="contact-message" className="sr-only">Sua mensagem</label>
                <textarea id="contact-message" name="message" placeholder="Sua mensagem" rows={5} required autoComplete="off"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
              </div>
              {error && <p className="text-red-300 text-sm" role="alert">{error}</p>}
              <button type="submit"
                className="w-full rounded-2xl bg-primary-600 text-white font-semibold px-5 py-3 hover:bg-primary-700 transition-colors">
                {sent ? 'Mensagem enviada!' : 'Enviar mensagem'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
