export default function Privacidade() {
  return (
    <div className="max-w-3xl mx-auto p-8 bg-white text-slate-800">
      <h1 className="text-3xl font-bold mb-6">Política de Privacidade</h1>
      
      <div className="space-y-4">
        <p><strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
        
        <p>Esta Política de Privacidade descreve como o <strong>Sistema de Gestão de Documentos</strong> coleta, usa e protege suas informações pessoais quando você utiliza nosso serviço.</p>
        
        <h2 className="text-xl font-semibold mt-6 mb-2">1. Informações que Coletamos</h2>
        <p>Coletamos as seguintes informações quando você faz login usando sua conta do Google:</p>
        <ul className="list-disc pl-6">
          <li><strong>Endereço de e-mail:</strong> Usado exclusivamente para verificar sua autorização e perfil de acesso no sistema.</li>
          <li><strong>Nome e foto do perfil:</strong> Usados para exibir sua identidade dentro da plataforma, facilitando a auditoria de quem cadastrou ou modificou documentos.</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-6 mb-2">2. Como Usamos suas Informações</h2>
        <p>Os dados coletados pelo Google OAuth são utilizados apenas para fins de autenticação (Login) e segurança (controle de quem acessa quais áreas do sistema). Não utilizamos seus dados para marketing, anúncios ou qualquer outro fim comercial.</p>
        
        <h2 className="text-xl font-semibold mt-6 mb-2">3. Compartilhamento de Dados</h2>
        <p>Não compartilhamos, vendemos ou alugamos suas informações pessoais com terceiros. Seus dados ficam restritos ao banco de dados do sistema, acessível apenas pelos administradores.</p>
        
        <h2 className="text-xl font-semibold mt-6 mb-2">4. Segurança</h2>
        <p>Implementamos medidas de segurança para proteger suas informações. No entanto, lembre-se de que nenhum método de transmissão pela Internet ou método de armazenamento eletrônico é 100% seguro.</p>
        
        <h2 className="text-xl font-semibold mt-6 mb-2">5. Contato</h2>
        <p>Se você tiver alguma dúvida sobre esta Política de Privacidade, entre em contato com o administrador do sistema através do e-mail oficial (u1.swtecnologias@gmail.com).</p>
      </div>
    </div>
  );
}
