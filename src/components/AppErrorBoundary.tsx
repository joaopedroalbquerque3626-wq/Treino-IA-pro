import React from 'react';

interface State {
  hasError: boolean;
}

export class AppErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Erro não tratado no TREINO IA PRO:', error, info);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="min-h-[100dvh] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex items-center justify-center px-4">
        <section className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl text-center space-y-4" role="alert" aria-live="assertive">
          <div className="text-4xl" aria-hidden="true">⚠️</div>
          <div>
            <h1 className="text-xl font-black">Não foi possível carregar esta tela</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Seus dados salvos continuam no dispositivo. Recarregue o aplicativo para tentar novamente.
            </p>
          </div>
          <button
            type="button"
            onClick={this.handleReload}
            className="w-full min-h-[48px] rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
          >
            Recarregar aplicativo
          </button>
        </section>
      </main>
    );
  }
}
