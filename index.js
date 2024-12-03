import express from 'express';
import  Session  from 'express-session';
import cookieParser from 'cookie-parser';

const porta = 3000
const host = '0.0.0.0';
const app = express();
app.use(express.urlencoded({extended: true}));

app.use(express.static('./pages/public'));
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

function login(req , resp){

    const novousuario = req.body.usuarion;
    const novasenha =  req.body.senhan;

}





//enviando para a pagina de login
app.get('/login',(req,resp)=>{
    resp.redirect('/login.html'); 
})
// Iniciando o servidor
app.listen(porta, host, () => {
    console.log(`Servidor iniciado em http://${host}:${porta}`);
});