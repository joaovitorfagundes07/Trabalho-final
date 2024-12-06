import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import path from 'path';

const porta = 3000;
const host = '0.0.0.0';
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(),'./pages/public')));
app.use(cookieParser());

app.use(session({
  secret: 'MinhaChave3232c',
  resave: false,                  
  saveUninitialized: true,      
  cookie: {
      secure:false, 
      httpOnly:true,
      maxAge:1000 * 60 * 30 //tempo de 30 minutos para excluir a sessao
  }
}));

let usuarios = []; // Lista para armazenar os usuários cadastrados

//Menu do sistema
function menu(req, resp){
  let dataHoraUltimoAcesso = req.cookies['datahoraUltimoAcesso'];
  
  if (!dataHoraUltimoAcesso) {
      dataHoraUltimoAcesso = 'Nunca';  // Definindo um valor padrão caso o cookie não exista
  }

  resp.send(`
    <html lang="pt-BR">
      <head>
        <title>Menu</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
      </head>
      <body>
        <nav class="navbar bg-body-tertiary">
            <div class="container-fluid">
                <a class="navbar-brand" href="/cadastraraluno">cadastrar aluno</a>
            </div>
        </nav>

        <nav class="navbar bg-body-tertiary">
            <div class="container-fluid">
                <a class="navbar-brand" href="/lista">Lista</a>
            </div>
            <div class="container-fluid">
                <a class="navbar-brand" href="/logout">Sair</a>
            </div>
            <div>
              <li class="nav-item">
                  <a class="nav-link disabled" aria-disabled="true"> seu ultimo acesso foi realizado em ${dataHoraUltimoAcesso} </a>
              </li>
            </div>
        </nav>
      </body>
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
    </html>
  `);
}

// Função de cadastro
function cadlog(req, resp) {
    const { usuarion, senhanov } = req.body;

    if (!usuarion || !senhanov) {
        return resp.send(`
            <html lang="pt-BR">
                    <head>
                    <title>Menu</title>
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
                    </head>
                    <body>
                        <div class="alert alert-dark" role="alert">
                          Preencha os campos!!!
                        </div>
                        <div>
                        <a href= "/cadlog.html"  class="btn btn-outline-danger">tente novamente</a>
                        </div>  
                    </body>
        `);
    }
    
   //verificando se ja esta cadastraado
    for (let i = 0; i < usuarios.length; i++) {
      if (usuarios[i].usuario === usuarion) {
          return resp.send(`
               <html lang="pt-BR">
                    <head>
                    <title>Menu</title>
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
                    </head>
                    <body>
                        <div class="alert alert-dark" role="alert">
                         Este nome ja esta cadastrado!!!
                        </div>
                        <div>
                        <a href= "/login.html"  class="btn btn-outline-danger">tente novamente</a>
                        </div>  
                    </body>
          `);
      }
  }

    const novousuario = { usuario: usuarion, senha: senhanov };
    usuarios.push(novousuario);
    resp.redirect('/login.html');
}

// Função de autenticação
function autenticar(req, resp) {
  const { usuarion, senhanov } = req.body;

  if (!usuarion || !senhanov) {
      return resp.send(`
            <html lang="pt-BR">
                    <head>
                    <title>Menu</title>
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
                    </head>
                    <body>
                        <div class="alert alert-dark" role="alert">
                          Preencha os campos!!!
                        </div>
                        <div>
                        <a href= "/login.html"  class="btn btn-outline-danger">tente novamente</a>
                        </div>  
                    </body>
      `);
  }

  const usuarioEncontrado = usuarios.find(u => u.usuario === usuarion && u.senha === senhanov);
  
  if (usuarioEncontrado) {
      req.session.usuariologado = usuarioEncontrado.usuario; // Armazena o usuário na sessão
      resp.redirect('/');
  } else {
      resp.send(`
           <html lang="pt-BR">
                    <head>
                    <title>Menu</title>
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
                    </head>
                    <body>
                        <div class="alert alert-dark" role="alert">
                          Usuario ou senha invalida!!!
                        </div>
                        <div>
                        <a href= "/login.html"  class="btn btn-outline-danger">tente novamente</a>
                        </div>  
                    </body>
      `);
  }
}

function autenticacao(req, resp, next) {
  if (req.session && req.session.usuariologado) {
      // Atualiza o cookie com o horário atual sempre que a autenticação ocorrer
      resp.cookie('datahoraUltimoAcesso', new Date().toLocaleString("pt-BR", {
          timeZone: "America/Sao_Paulo"
      }), { maxAge: 1000 * 60 * 60 * 24 * 30 });
      next(); // Usuário autenticado, continua
  } else {
      resp.redirect('/login.html');
  }
}

app.get('/logout', (req, resp) => {
  req.session.destroy(err => {
      if (err) {
          return resp.send('Erro ao sair!');
      }
      resp.clearCookie('connect.sid');
      resp.redirect('/login.html');
  });
});

// Rota para exibir o login
app.get('/login', (req, resp) => {
  resp.redirect('/login.html');
});
//Roteando a pagina
app.get('/',autenticacao,menu);
// Rota para o cadastro
app.post('/cadastro', cadlog);

// Rota para autenticação
app.post('/login', autenticar);

// Iniciar o servidor
app.listen(porta, host, () => {
  console.log(`Servidor iniciado em http://${host}:${porta}`);
});
