const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const blogPosts = [
    {
        title: "Como preparar seu lar para um novo pet",
        content: "Receber um novo animal exige planejamento. Veja dicas importantes para que a adaptação seja tranquila para todos.",
        excerpt: "Dicas essenciais para preparar a casa para adoção.",
        author: "Ana Oliveira",
        authorId: "ana123",
        authorAvatar: "https://randomuser.me/api/portraits/women/45.jpg",
        date: admin.firestore.Timestamp.fromDate(new Date("2025-05-10")),
        image: "https://images.unsplash.com/photo-1560807707-8cc77767d783?auto=format&fit=crop&w=800&q=80",
        likes: 30,
        comments: 5,
        category: "Cuidados",
        status: "published",
        readTime: "4 min",
    },
    {
        title: "História do Thor: de abandonado a herói",
        content: "Conheça a trajetória do Thor, um cão que salvou uma criança e conquistou uma nova família.",
        excerpt: "A incrível jornada de superação de Thor.",
        author: "Carlos Mendes",
        authorId: "carlos456",
        authorAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
        date: admin.firestore.Timestamp.fromDate(new Date("2025-03-15")),
        image: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=800&q=80",
        likes: 58,
        comments: 12,
        category: "Histórias reais",
        status: "published",
        readTime: "5 min",
    },
    {
        title: "Importância da vacinação para pets",
        content: "Saiba quais vacinas seu pet precisa e por que a vacinação é fundamental para a saúde deles.",
        excerpt: "Proteja seu pet: vacinação em dia.",
        author: "Marina Silva",
        authorId: "marina789",
        authorAvatar: "https://randomuser.me/api/portraits/women/68.jpg",
        date: admin.firestore.Timestamp.fromDate(new Date("2025-04-20")),
        image: "https://images.unsplash.com/photo-1583337130417-7602a51f8d6a?auto=format&fit=crop&w=800&q=80",
        likes: 45,
        comments: 9,
        category: "Saúde",
        status: "published",
        readTime: "3 min",
    },
    {
        title: "Adotar é um ato de amor",
        content: "Veja as vantagens da adoção responsável e como isso pode mudar a vida de um pet e da sua família.",
        excerpt: "Adotar muda vidas, inclusive a sua.",
        author: "Lucas Ferreira",
        authorId: "lucas321",
        authorAvatar: "https://randomuser.me/api/portraits/men/54.jpg",
        date: admin.firestore.Timestamp.fromDate(new Date("2025-06-01")),
        image: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=800&q=80",
        likes: 75,
        comments: 15,
        category: "Adoção",
        status: "published",
        readTime: "6 min",
    },
    {
        title: "Dicas para cuidar de pets com necessidades especiais",
        content: "Saiba como adaptar seu lar e rotina para oferecer o melhor cuidado para pets com necessidades especiais.",
        excerpt: "Cuidando com amor e atenção.",
        author: "Isabela Costa",
        authorId: "isabela654",
        authorAvatar: "https://randomuser.me/api/portraits/women/21.jpg",
        date: admin.firestore.Timestamp.fromDate(new Date("2025-05-28")),
        image: "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=800&q=80",
        likes: 22,
        comments: 4,
        category: "Cuidados Especiais",
        status: "published",
        readTime: "4 min",
    }
];

const pets = [
    {
        name: "Luna",
        age: "2 anos",
        type: "cachorro",
        breed: "Labrador",
        gender: "fêmea",
        size: "grande",
        color: "preto",
        description: "Brincalhona, ótima com crianças.",
        history: "Resgatada de situação de maus-tratos.",
        images: [
            "https://images.unsplash.com/photo-1560807707-8cc77767d783?auto=format&fit=crop&w=800&q=80"
        ],
        requirements: ["Espaço amplo", "Família presente"],
        location: "São Paulo, SP",
        vaccinated: true,
        neutered: true,
        specialNeeds: false,
        status: "available",
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
        createdBy: "ong123"
    },
    {
        name: "Mimi",
        age: "1 ano",
        type: "gato",
        breed: "SRD",
        gender: "fêmea",
        size: "pequeno",
        color: "cinza",
        description: "Carinhosa e calma, adora colo.",
        history: "Abandonada ainda filhote.",
        images: [
            "https://images.unsplash.com/photo-1574158622681-7b3c1c8d3b7b?auto=format&fit=crop&w=800&q=80"
        ],
        requirements: ["Ambiente calmo", "Janela telada"],
        location: "Parnaíba, PI",
        vaccinated: true,
        neutered: true,
        specialNeeds: true,
        specialNeedsDescription: "Precisa de medicação diária para rins.",
        status: "available",
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
        createdBy: "ong456"
    },
    {
        name: "Bolt",
        age: "3 anos",
        type: "cachorro",
        breed: "Pastor Alemão",
        gender: "macho",
        size: "grande",
        color: "marrom e preto",
        description: "Protector e inteligente, ótimo cão de guarda.",
        history: "Doado por família que não podia cuidar.",
        images: [
            "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=800&q=80"
        ],
        requirements: ["Exercício diário", "Treinamento constante"],
        location: "Belo Horizonte, MG",
        vaccinated: true,
        neutered: false,
        specialNeeds: false,
        status: "available",
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
        createdBy: "ong789"
    },
    {
        name: "Mia",
        age: "4 meses",
        type: "gato",
        breed: "Siamês",
        gender: "fêmea",
        size: "pequeno",
        color: "bege com preto",
        description: "Curiosa e brincalhona, adora subir em móveis.",
        history: "Encontrada na rua, está em recuperação.",
        images: [
            "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=800&q=80"
        ],
        requirements: ["Ambiente seguro", "Brinquedos"],
        location: "Curitiba, PR",
        vaccinated: false,
        neutered: false,
        specialNeeds: false,
        status: "pending",
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
        createdBy: "ong321"
    },
    {
        name: "Thor",
        age: "5 anos",
        type: "cachorro",
        breed: "Boxer",
        gender: "macho",
        size: "médio",
        color: "marrom",
        description: "Calmo e carinhoso, ótimo com crianças.",
        history: "Resgatado de abandono.",
        images: [
            "https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=800&q=80"
        ],
        requirements: ["Casa com quintal", "Atenção diária"],
        location: "Rio de Janeiro, RJ",
        vaccinated: true,
        neutered: true,
        specialNeeds: false,
        status: "adopted",
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
        createdBy: "ong654"
    }
];

const comments = [
    {
        postId: "", // vai ser atualizado após criação do post
        author: "Joana Lima",
        authorId: "joana789",
        authorAvatar: "https://randomuser.me/api/portraits/women/33.jpg",
        date: admin.firestore.Timestamp.fromDate(new Date("2025-06-12")),
        content: "Amei a história do Thor!",
        likes: 8
    },
    {
        postId: "",
        author: "Felipe Rocha",
        authorId: "felipe987",
        authorAvatar: "https://randomuser.me/api/portraits/men/11.jpg",
        date: admin.firestore.Timestamp.fromDate(new Date("2025-06-13")),
        content: "Muito inspirador!",
        likes: 3
    },
    {
        postId: "",
        author: "Camila Souza",
        authorId: "camila321",
        authorAvatar: "https://randomuser.me/api/portraits/women/55.jpg",
        date: admin.firestore.Timestamp.fromDate(new Date("2025-06-10")),
        content: "Gostaria de saber mais sobre a adoção de gatos.",
        likes: 6
    },
    {
        postId: "",
        author: "Rafael Silva",
        authorId: "rafael654",
        authorAvatar: "https://randomuser.me/api/portraits/men/40.jpg",
        date: admin.firestore.Timestamp.fromDate(new Date("2025-06-11")),
        content: "As dicas para preparar a casa foram muito úteis.",
        likes: 4
    },
    {
        postId: "",
        author: "Larissa Martins",
        authorId: "larissa987",
        authorAvatar: "https://randomuser.me/api/portraits/women/15.jpg",
        date: admin.firestore.Timestamp.fromDate(new Date("2025-06-09")),
        content: "Muito bom conteúdo, parabéns!",
        likes: 7
    }
];

async function importAll() {
    const postRefs = [];

    // Import blog posts
    for (const post of blogPosts) {
        const docRef = await db.collection("blog_posts").add(post);
        postRefs.push(docRef.id);
    }

    // Import pets
    for (const pet of pets) {
        await db.collection("pets").add(pet);
    }

    // Atualiza postId nos comentários e importa
    comments.forEach((comment, i) => {
        comment.postId = postRefs[i % postRefs.length];
    });
    for (const comment of comments) {
        await db.collection("comments").add(comment);
    }

    console.log("✅ Importação concluída com dados e imagens reais.");
}

importAll().catch(console.error);
