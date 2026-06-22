const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;

// Configuração do Next.js
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    // Fazer o parse da URL
    const parsedUrl = parse(req.url, true);
    
    // Deixar o Next.js lidar com a requisição
    handle(req, res, parsedUrl);
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> App rodando na porta ${port}`);
  });
});
