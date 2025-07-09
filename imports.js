const admin = require("firebase-admin")
const serviceAccount = require("./serviceAccountKey.json")

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
})

const db = admin.firestore()

const blogPosts = [
    {
        title: "Primeiros passos na adoção de cães: guia completo",
        content:
            "Adotar um cão é uma decisão que mudará sua vida para sempre. Neste guia, você encontrará todas as informações necessárias para fazer uma adoção responsável, desde a escolha do pet ideal até os primeiros cuidados em casa. Abordaremos questões como preparação do ambiente, documentação necessária e adaptação do animal ao novo lar.",
        excerpt: "Tudo que você precisa saber antes de adotar seu primeiro cão.",
        author: "Dr. Ricardo Almeida",
        authorId: "ricardo123",
        authorAvatar: "https://randomuser.me/api/portraits/men/45.jpg",
        date: admin.firestore.Timestamp.fromDate(new Date("2025-01-05")),
        image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=800&q=80", // Pessoa adotando cão
        likes: 42,
        comments: 8,
        category: "Adoção",
        status: "published",
        readTime: "6 min",
    },
    {
        title: "Cuidados essenciais com gatos filhotes",
        content:
            "Os primeiros meses de vida de um gatinho são cruciais para seu desenvolvimento saudável. Este artigo aborda alimentação adequada, vacinação, socialização e cuidados veterinários essenciais. Também discutimos como criar um ambiente seguro e estimulante para filhotes de gatos, incluindo brinquedos apropriados e áreas de descanso.",
        excerpt: "Como cuidar adequadamente de gatinhos nos primeiros meses de vida.",
        author: "Dra. Fernanda Costa",
        authorId: "fernanda456",
        authorAvatar: "https://randomuser.me/api/portraits/women/32.jpg",
        date: admin.firestore.Timestamp.fromDate(new Date("2025-01-12")),
        image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=800&q=80", // Gatinhos filhotes
        likes: 67,
        comments: 12,
        category: "Cuidados",
        status: "published",
        readTime: "5 min",
    },
    {
        title: "Pets idosos: amor e cuidados especiais",
        content:
            "Animais idosos merecem atenção especial e muito amor. Neste artigo, exploramos as necessidades específicas de cães e gatos na terceira idade, incluindo adaptações na alimentação, exercícios adequados, cuidados médicos preventivos e como proporcionar conforto e qualidade de vida. Também abordamos a importância da adoção de pets idosos.",
        excerpt: "Cuidando com carinho dos nossos companheiros na melhor idade.",
        author: "Veterinária Ana Paula",
        authorId: "ana789",
        authorAvatar: "https://randomuser.me/api/portraits/women/58.jpg",
        date: admin.firestore.Timestamp.fromDate(new Date("2025-01-18")),
        image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80", // Cão idoso
        likes: 89,
        comments: 15,
        category: "Cuidados Especiais",
        status: "published",
        readTime: "7 min",
    },
    {
        title: "A importância da castração para pets",
        content:
            "A castração é um procedimento fundamental para a saúde e bem-estar dos animais de estimação. Este artigo explica os benefícios médicos e comportamentais da castração, o melhor momento para realizar o procedimento, cuidados pós-operatórios e como isso contribui para o controle populacional de animais abandonados.",
        excerpt: "Entenda por que a castração é essencial para seu pet.",
        author: "Dr. Carlos Mendes",
        authorId: "carlos321",
        authorAvatar: "https://randomuser.me/api/portraits/men/41.jpg",
        date: admin.firestore.Timestamp.fromDate(new Date("2025-01-25")),
        image: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=800&q=80", // Veterinário com pet
        likes: 54,
        comments: 9,
        category: "Saúde",
        status: "published",
        readTime: "4 min",
    },
    {
        title: "Histórias de superação: pets que encontraram uma nova chance",
        content:
            "Conheça histórias emocionantes de animais que superaram traumas e encontraram famílias amorosas. Desde cães resgatados de situações de maus-tratos até gatos abandonados que se tornaram companheiros fiéis, estas narrativas mostram o poder transformador do amor e cuidado. Cada história é um testemunho da resiliência animal e da importância da adoção responsável.",
        excerpt: "Histórias reais que tocam o coração e inspiram a adoção.",
        author: "Jornalista Marina Silva",
        authorId: "marina654",
        authorAvatar: "https://randomuser.me/api/portraits/women/28.jpg",
        date: admin.firestore.Timestamp.fromDate(new Date("2025-02-01")),
        image: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=800&q=80", // Cão resgatado feliz
        likes: 126,
        comments: 23,
        category: "Histórias Reais",
        status: "published",
        readTime: "8 min",
    },
]

const pets = [
    {
        name: "Bella",
        age: "2 anos",
        type: "cachorro",
        breed: "Golden Retriever",
        gender: "fêmea",
        size: "grande",
        color: "dourado",
        description:
            "Bella é uma cadela extremamente carinhosa e brincalhona. Adora crianças e é muito obediente. Tem energia para brincar, mas também ama momentos de carinho no sofá.",
        history:
            "Bella foi resgatada de uma situação de abandono quando ainda era filhote. Passou por tratamento veterinário completo e agora está pronta para encontrar uma família amorosa.",
        images: ["https://www.canilgoldenpremier.com.br/assets/images/nossos/femeas/g/dig1.jpg"], // Golden Retriever fêmea dourada
        requirements: ["Casa com quintal", "Família ativa", "Tempo para exercícios diários"],
        location: "São Paulo, SP",
        vaccinated: true,
        neutered: true,
        specialNeeds: false,
        status: "available",
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
        createdBy: "5F0yAX4lG2gPr5NchPbreCp6Dn03",
    },
    {
        name: "Simba",
        age: "6 meses",
        type: "gato",
        breed: "Persa",
        gender: "macho",
        size: "pequeno",
        color: "laranja",
        description:
            "Simba é um gatinho persa muito carinhoso e tranquilo. Adora colo e ronrona sempre que recebe carinho. É brincalhão mas não destrutivo.",
        history:
            "Simba foi encontrado sozinho na rua quando tinha apenas 2 meses. Foi cuidado por uma família temporária e agora está pronto para adoção.",
        images: ["https://static.ndmais.com.br/2024/07/gato-persa-laranja-800x533.jpg"], // Gato persa laranja
        requirements: ["Ambiente interno", "Janelas teladas", "Paciência com filhote"],
        location: "Rio de Janeiro, RJ",
        vaccinated: true,
        neutered: false,
        specialNeeds: false,
        status: "available",
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
        createdBy: "5F0yAX4lG2gPr5NchPbreCp6Dn03",
    },
    {
        name: "Max",
        age: "4 anos",
        type: "cachorro",
        breed: "Labrador Mix",
        gender: "macho",
        size: "grande",
        color: "preto",
        description:
            "Max é um cão muito inteligente e leal. Já foi treinado e conhece comandos básicos. É protetor mas não agressivo, ideal para famílias.",
        history:
            "Max foi doado por uma família que se mudou para um apartamento pequeno. É um cão bem cuidado e socializado.",
        images: ["https://static.wixstatic.com/media/db516d_29006f5a1e304f068b4fea66c40bab83~mv2.jpg/v1/fill/w_640,h_450,al_c,q_80,usm_1.20_1.00_0.01,enc_avif,quality_auto/db516d_29006f5a1e304f068b4fea66c40bab83~mv2.jpg"], // Labrador preto
        requirements: ["Espaço amplo", "Exercícios regulares", "Família experiente com cães"],
        location: "Belo Horizonte, MG",
        vaccinated: true,
        neutered: true,
        specialNeeds: false,
        status: "available",
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
        createdBy: "5F0yAX4lG2gPr5NchPbreCp6Dn03",
    },
    {
        name: "Luna",
        age: "3 anos",
        type: "gato",
        breed: "SRD",
        gender: "fêmea",
        size: "médio",
        color: "cinza e branco",
        description:
            "Luna é uma gata muito independente mas carinhosa. Gosta de observar pela janela e é muito limpa. Convive bem com outros gatos.",
        history:
            "Luna vivia na rua e foi resgatada grávida. Seus filhotes já foram adotados e agora é a vez dela encontrar um lar.",
        images: ["https://blog-static.petlove.com.br/wp-content/uploads/2020/10/gato-cinza-tigrado-petove.jpg"], // Gata cinza e branca
        requirements: ["Ambiente calmo", "Janelas teladas", "Caixa de areia sempre limpa"],
        location: "Curitiba, PR",
        vaccinated: true,
        neutered: true,
        specialNeeds: false,
        status: "available",
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
        createdBy: "5F0yAX4lG2gPr5NchPbreCp6Dn03",
    },
    {
        name: "Thor",
        age: "8 anos",
        type: "cachorro",
        breed: "Pastor Alemão",
        gender: "macho",
        size: "grande",
        color: "marrom e preto",
        description:
            "Thor é um cão idoso muito sábio e calmo. Apesar da idade, ainda gosta de caminhadas leves. É extremamente fiel e carinhoso.",
        history:
            "Thor foi abandonado após seu dono idoso falecer. É um cão bem educado que merece passar seus anos dourados em uma família amorosa.",
        images: ["https://images.unsplash.com/photo-1630357265106-8ea40e77ab30?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"], // Pastor Alemão marrom e preto
        requirements: ["Família paciente", "Cuidados veterinários regulares", "Ambiente tranquilo"],
        location: "Porto Alegre, RS",
        vaccinated: true,
        neutered: true,
        specialNeeds: true,
        specialNeedsDescription: "Artrite leve, precisa de medicação para dor ocasionalmente.",
        status: "available",
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
        createdBy: "5F0yAX4lG2gPr5NchPbreCp6Dn03",
    },
]

const comments = [
    {
        postId: "", // será atualizado após criação do post
        author: "Maria Santos",
        authorId: "maria123",
        authorAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
        date: admin.firestore.Timestamp.fromDate(new Date("2025-01-06")),
        content: "Excelente artigo! Me ajudou muito na decisão de adotar meu primeiro cão.",
        likes: 12,
    },
    {
        postId: "",
        author: "João Silva",
        authorId: "joao456",
        authorAvatar: "https://randomuser.me/api/portraits/men/33.jpg",
        date: admin.firestore.Timestamp.fromDate(new Date("2025-01-13")),
        content: "As dicas sobre gatinhos foram muito úteis. Minha gatinha está crescendo saudável!",
        likes: 8,
    },
    {
        postId: "",
        author: "Carla Oliveira",
        authorId: "carla789",
        authorAvatar: "https://randomuser.me/api/portraits/women/29.jpg",
        date: admin.firestore.Timestamp.fromDate(new Date("2025-01-19")),
        content: "Que bom ver conteúdo sobre pets idosos. Eles merecem muito amor!",
        likes: 15,
    },
    {
        postId: "",
        author: "Pedro Costa",
        authorId: "pedro321",
        authorAvatar: "https://randomuser.me/api/portraits/men/52.jpg",
        date: admin.firestore.Timestamp.fromDate(new Date("2025-01-26")),
        content: "Informações muito importantes sobre castração. Todos deveriam ler!",
        likes: 6,
    },
    {
        postId: "",
        author: "Lucia Ferreira",
        authorId: "lucia654",
        authorAvatar: "https://randomuser.me/api/portraits/women/38.jpg",
        date: admin.firestore.Timestamp.fromDate(new Date("2025-02-02")),
        content: "Chorei lendo essas histórias. Que inspiração para adotar!",
        likes: 22,
    },
]

async function importAll() {
    try {
        console.log("🚀 Iniciando importação dos dados...")

        const postRefs = []

        // Import blog posts
        console.log("📝 Importando posts do blog...")
        for (const post of blogPosts) {
            const docRef = await db.collection("blog_posts").add(post)
            postRefs.push(docRef.id)
            console.log(`✅ Post "${post.title}" importado com ID: ${docRef.id}`)
        }

        // Import pets
        console.log("🐕 Importando pets...")
        for (const pet of pets) {
            const docRef = await db.collection("pets").add(pet)
            console.log(`✅ Pet "${pet.name}" importado com ID: ${docRef.id}`)
        }

        // Atualiza postId nos comentários e importa
        console.log("💬 Importando comentários...")
        comments.forEach((comment, i) => {
            comment.postId = postRefs[i % postRefs.length]
        })

        for (const comment of comments) {
            const docRef = await db.collection("comments").add(comment)
            console.log(`✅ Comentário de "${comment.author}" importado com ID: ${docRef.id}`)
        }

        console.log("🎉 Importação concluída com sucesso!")
        console.log(`📊 Resumo: ${blogPosts.length} posts, ${pets.length} pets, ${comments.length} comentários`)
    } catch (error) {
        console.error("❌ Erro durante a importação:", error)
    }
}

importAll().catch(console.error)
