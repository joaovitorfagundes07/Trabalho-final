import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import path from 'path';

const porta = process.env.PORT || 3000;
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
      secure: false, 
      httpOnly: true,
      maxAge: 1000 * 60 * 30 // tempo de 30 minutos para excluir a sessão
    }
  })); 

let usuarioscad = [] //lista de cadastrados
let usuarios = []; // Lista para logins
let mensagens = []; //lista de mensagens
let usuariosLogados = []; // Lista de usuários que estão logados

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
                <a class="navbar-brand" href="/cadusuario.html">cadastrar aluno</a>
            </div>
        </nav>

        <nav class="navbar bg-body-tertiary">
            <div class="container-fluid">
                <a class="navbar-brand" href="/batepapo">Bate-Papo</a>
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

//cadastrar usuario
function cadusuario(req,resp){
    const { nome, dataNascimento, nickname } = req.body;
    let nicknameexistente = false;
    if (!nome || !dataNascimento || !nickname) {
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
                        <a href= "/cadusuario.html"  class="btn btn-outline-danger">tente novamente</a>
                    </div>  
                </body>
            </html>
        `);
      }

      for(let i=0;i<usuarioscad.length;i++){
        if(usuarioscad[i].nickname===nickname){
            nicknameexistente = true;
            break;
        }
      }

      if(nicknameexistente){
        return resp.send(`
            <html lang="pt-BR">
                <head>
                    <title>Menu</title>
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
                </head>
                <body>
                    <div class="alert alert-dark" role="alert">
                        Este apelido já está em uso!!!
                    </div>
                    <div>
                        <a href= "/cadusuario.html"  class="btn btn-outline-danger">Voltar</a>
                    </div>  
                </body>
            </html>
        `);
      }

      usuarioscad.push({ nome, dataNascimento ,nickname });

      const listaUsuarios = usuarioscad.map( u=> `<li>${u.nome} (${u.nickname})</li>`).join('');
      const listaUsuario = usuarioscad.map(u => `<li class="list-group-item">${u.nome} (${u.nickname})</li>`).join('');
      resp.send(`
        <html lang="pt-BR">
          <head>
            <title>Usuário Cadastrado</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
          </head>
          <body>
            <div class="container mt-4">
              <h1 class="mb-4">Usuário cadastrado com sucesso!</h1>
              <ul class="list-group">
                ${listaUsuario}
              </ul>
              <div class="mt-4">
                <a href="/cadusuario.html" class="btn btn-primary">Cadastrar outro usuário</a>
                <a href="/" class="btn btn-secondary">Menu</a>
              </div>
            </div>
          </body>
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
                          Preencha todos campos!!!
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

// Função de autenticação de login
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
                          Preencha todos campos!!!
                        </div>
                        <div>
                        <a href= "/cadlog.html"  class="btn btn-outline-danger">tente novamente</a>
                        </div>  
                    </body>
      `);
    }
  
    const usuarioEncontrado = usuarios.find(u => u.usuario === usuarion && u.senha === senhanov);
  
    if (usuarioEncontrado) {
      // Usuário encontrado e login válido
      req.session.usuariologado = usuarioEncontrado.usuario;  // Salvando o usuário na sessão
      usuariosLogados.push(usuarion); // Adiciona à lista de logados
      resp.redirect('/'); // Redireciona para o menu
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
                        <a href= "/cadlog.html"  class="btn btn-outline-danger">tente novamente</a>
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
    if (req.session && req.session.usuariologado) {
      // Remove o usuário da lista de logados
      const index = usuariosLogados.indexOf(req.session.usuariologado);
      if (index > -1) {
        usuariosLogados.splice(index, 1); // Remove o usuário da lista de logados
      }
      req.session.destroy(err => {
        if (err) {
          return resp.send('Erro ao sair!');
        }
        resp.clearCookie('connect.sid'); // Limpa o cookie da sessão
        resp.redirect('/login.html'); // Redireciona para a página de login
      });
    } else {
      resp.redirect('/login.html'); // Se o usuário não estiver logado
    }
  });
  

app.get('/batepapo',autenticacao,(req,resp) => {
    const listaMensagens = mensagens.map(msg => `  
                <li class="list-group-item">
                    <strong>${msg.nickname}</strong>: ${msg.texto} <br>
                    <small class="text-muted">${msg.dataHora}</small>
                </li>
        `).join('');

        resp.send(`
        <html lang="pt-BR">
        <head>
            <title>Bate-Papo</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
        </head>
        <body>
            <div class="container mt-4">
                <h1 class="mb-4">Bate-Papo</h1>
                <ul class="list-group mb-4">
                    ${listaMensagens}
                </ul>
        <form action="/postarMensagem" method="POST">
            <div class="mb-3">
                <label for="nickname" class="form-label">Usuário</label>
                <select id="nickname" name="nickname" class="form-select">
                <option value="" disabled selected>Selecione um usuário</option>
                    ${usuarioscad.map(u => `<option value="${u.nickname}">${u.nickname}</option>`).join('')}
                </select>
            </div>
            <div class="mb-3">
                <label for="texto" class="form-label">Mensagem</label>
                <input type="text" id="texto" name="texto" class="form-control">
            </div>
                 <button type="submit" class="btn btn-primary">Enviar</button>
            </form>
                <a href="/" class="btn btn-secondary mt-4">Menu</a>
            </div>
        </body>
        </html>
    `);

});

app.post('/postarMensagem', autenticacao, (req, resp) => {
    const { nickname, texto } = req.body;

    if (!nickname || !texto) {
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
                        <a href= "/batepapo"  class="btn btn-outline-danger">tente novamente</a>
                        </div>  
            </body>
        `);
    }

    // Adicionar a mensagem à lista
    const novaMensagem = {
        nickname,
        texto,
        dataHora: new Date().toLocaleString("pt-BR", {
            timeZone: "America/Sao_Paulo"
        })
    };
    mensagens.push(novaMensagem);

    // Redirecionar de volta para o bate-papo
    resp.redirect('/batepapo');
});


app.post('/formulario',autenticacao,cadusuario);
app.get('/formulario',autenticacao);

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
app.listen(porta, () => {
    console.log(`Servidor rodando na porta ${porta}`);
  });
