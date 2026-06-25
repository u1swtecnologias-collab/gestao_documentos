export default function Termos() {
  return (
    <div className="max-w-3xl mx-auto p-8 bg-white text-slate-800">
      <h1 className="text-3xl font-bold mb-6">Termos de Serviço</h1>
      
      <div className="space-y-4">
        <p><strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
        
        <p>Bem-vindo ao <strong>Sistema de Gestão de Documentos</strong>. Ao acessar e usar nossa plataforma, você concorda com os seguintes termos e condições:</p>
        
        <h2 className="text-xl font-semibold mt-6 mb-2">1. Uso do Sistema</h2>
        <p>O acesso a este sistema é restrito e deve ser realizado apenas por usuários expressamente autorizados pelos administradores. O sistema destina-se exclusivamente ao armazenamento, organização e gestão de documentos internos e processos.</p>
        
        <h2 className="text-xl font-semibold mt-6 mb-2">2. Responsabilidade do Usuário</h2>
        <p>Você é responsável por manter a confidencialidade das suas credenciais de acesso (sua conta do Google). Qualquer ação realizada no sistema sob sua conta é de sua inteira responsabilidade. Você concorda em não inserir documentos ou arquivos que violem leis ou que contenham vírus/malwares.</p>
        
        <h2 className="text-xl font-semibold mt-6 mb-2">3. Propriedade Intelectual</h2>
        <p>Todo o conteúdo, organização, gráficos, design e outros assuntos relacionados ao sistema são protegidos por direitos autorais e outras leis de propriedade intelectual. É estritamente proibida a cópia, redistribuição, uso ou publicação por você de qualquer parte do sistema.</p>
        
        <h2 className="text-xl font-semibold mt-6 mb-2">4. Suspensão de Acesso</h2>
        <p>Os administradores do sistema reservam-se o direito de alterar o perfil de acesso, suspender ou banir qualquer usuário que viole estes termos ou comprometa a integridade dos dados armazenados na plataforma, sem aviso prévio.</p>
        
        <h2 className="text-xl font-semibold mt-6 mb-2">5. Limitação de Responsabilidade</h2>
        <p>Em nenhum caso o sistema ou seus desenvolvedores serão responsáveis por quaisquer danos indiretos, incidentais, especiais ou consequenciais decorrentes do uso ou da incapacidade de usar o serviço.</p>
        
        <h2 className="text-xl font-semibold mt-6 mb-2">6. Contato</h2>
        <p>Dúvidas sobre os Termos de Serviço devem ser enviadas para os administradores (u1.swtecnologias@gmail.com).</p>
      </div>
    </div>
  );
}
