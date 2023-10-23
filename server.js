// 1. 모듈 불러오기 및 초기화 
const express = require('express');
const cors = require('cors');
require("dotenv").config();
const OpenAI = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

const app = express();
const PORT  = 4000; 

app.listen(PORT,()=>{
    console.log(`서버가${PORT}번 에서 실행되고 있다.`)
})


// 2-1. EJS 뷰 엔진 설정
app.set('view engine', 'ejs');

// 2-2. 미들웨어 설정
app.use(express.json()); // json 파싱
app.use(cors());

app.use('/views', express.static('views'));// 'public' 폴더 내의 파일들을 '/public' 경로로 제공
app.use(express.urlencoded({ extended: true })); // form 데이터를 파싱하기 위한 미들웨어


// 3. 기본 라우트 설정
app.get('/', (req,res)=>{
    res.send('Hello,World!');
})

// get 라우트 설정
app.get('/chat', (req,res)=>{
    res.render('chat');
})

app.get('/create', (req,res)=>{
    res.render('create');
})


// post 요청 받아 cpt 통신

// 1. 친구chat 
app.post('/chat', async(req,res)=>{

    // 유저 메세지를 받아옴
    const {chatInput} = req.body;
    // 프롬프트 작성
    const prompt = `지금부터 너는 어떤 고민이나 질문도 잘 들어주고 진심으로 조언해주는 친근한 친구같은 챗봇이야. 어떤 질문이 와도 무조건 반말을 사용해야돼.
    처음에는 무조건 사용자에게 "안녕? 나는 친구챗봇이야. 너는 이름이 뭐야?"로 대화를 시작해.
    사용자가 만약 고민을 얘기하면 첫번째로 공감을 해주고, 최대한 도움을 주기 위한 조언을 해줘야 돼.
    공감과 조언을 같이 해줘. 이외에 가벼운 농담이나 장난은 형식의 제한 없이 창의적이고 재밌게 답변해줘.`

    // OpenAI API호출
    try {
        const response = await openai.chat.completions.create({
            model : "gpt-3.5-turbo",
            messages:[
                {"role" : "system", "content": prompt},
                {"role" : "user", "content" : chatInput},
                
            ],
            max_tokens : 150,
        });
        const reply = response.choices[0].message.content;
        console.log(reply);
        res.json({text:reply});

    } catch(error){
        res.status(500).json({error : 'chat와의 통신중 오류가 발생했습니다.'+error});
    }

})
// 2. 이미지 생성chat 
app.post('/create', async (req, res) => {

    // 유저 메세지를 받아옴
    const { chatInput } = req.body;
    // 프롬프트 작성
    const prompt = `지금부터 너는 사용자가 요구하는 사항을 이해하고 정확하게 이미지를 생성해줘야 돼 ${chatInput}`

    // OpenAI API호출
    try {
        const response = await openai.images.generate({
            model: "image-alpha-001",
            prompt: prompt
        });
        const reply = response.data[0].url;
        // console.log(reply);
        res.json({imageUrl: reply});

    } catch (error) {
        res.status(500).json({ error: 'chat와의 통신중 오류가 발생했습니다.' + error });
    }

})

