"use server";

import { auth } from "@/auth";
import nodemailer from "nodemailer";

export async function solicitarAcessoAction() {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Usuário não autenticado.");
  }

  const { name, email } = session.user;
  
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: "u1.swtecnologias@gmail.com",
    subject: "Solicitação de Acesso ao Sistema de Gestão de Documentos",
    text: `Olá administrador,\n\nO usuário abaixo solicitou alteração do seu perfil de acesso para Editor/Gestor no Sistema de Gestão de Documentos:\n\nNome: ${name}\nE-mail: ${email}\n\nPor favor, acesse o painel administrativo para aprovar ou alterar o perfil.`,
    html: `
      <p>Olá administrador,</p>
      <p>O usuário abaixo solicitou alteração do seu perfil de acesso para Editor/Gestor no Sistema de Gestão de Documentos:</p>
      <ul>
        <li><strong>Nome:</strong> ${name}</li>
        <li><strong>E-mail:</strong> ${email}</li>
      </ul>
      <p>Por favor, acesse o painel administrativo para aprovar ou alterar o perfil.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: "Solicitação de acesso enviada com sucesso!" };
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    return { 
      success: false, 
      message: "Erro no servidor de e-mail. Para funcionar, é necessário configurar o EMAIL_USER e o EMAIL_PASS (Senha de Aplicativo do Google) nas variáveis de ambiente."
    };
  }
}
