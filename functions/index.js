const functions = require("firebase-functions")
const admin = require("firebase-admin")

admin.initializeApp()

// Esta função executa AUTOMATICAMENTE no servidor Firebase
// sempre que um novo documento é criado na coleção "pets"
exports.onPetCreated = functions.firestore.document("pets/{petId}").onCreate(async (snap, context) => {
    const petData = snap.data()
    const petId = context.params.petId

    try {
        console.log("Novo pet criado:", petData.name, petData.type)

        // Normalizar o tipo do pet para o tópico FCM
        const petType = petData.type.toLowerCase().replace(/[^a-z0-9]/g, "")

        // Criar mensagem de notificação
        const message = {
            notification: {
                title: `Novo ${petData.type} para adoção! 🐾`,
                body: `${petData.name} está procurando um lar. ${petData.age} anos, ${petData.breed}.`,
                icon: "https://your-app.com/icon.png", // Substitua pela URL do seu ícone
            },
            data: {
                petId: petId,
                petType: petData.type,
                petName: petData.name,
                action: "view_pet",
                screen: "pet-details", // Para Expo Router
            },
            topic: petType, // Envia para todos inscritos no tópico "gato", "cao", etc.
        }

        // Enviar notificação
        const response = await admin.messaging().send(message)
        console.log("Notificação enviada:", response)

        // Salvar histórico da notificação
        await admin.firestore().collection("notifications").add({
            petId: petId,
            petType: petData.type,
            topic: petType,
            title: message.notification.title,
            body: message.notification.body,
            sentAt: admin.firestore.FieldValue.serverTimestamp(),
            messageId: response,
        })

        return { success: true }
    } catch (error) {
        console.error("Erro ao enviar notificação:", error)
        return { error: error.message }
    }
})

// Função para quando um pet é favoritado
exports.onPetFavorited = functions.firestore.document("favorites/{favoriteId}").onCreate(async (snap, context) => {
    const favoriteData = snap.data()

    try {
        // Buscar dados do pet
        const petDoc = await admin.firestore().collection("pets").doc(favoriteData.petId).get()
        if (!petDoc.exists) return

        const petData = petDoc.data()

        // Buscar dados do usuário
        const userDoc = await admin.firestore().collection("users").doc(favoriteData.userId).get()
        if (!userDoc.exists || !userDoc.data().fcmToken) return

        const userData = userDoc.data()

        // Enviar notificação personalizada para o usuário específico
        const message = {
            notification: {
                title: `${petData.name} foi adicionado aos seus favoritos! ❤️`,
                body: `Você receberá notificações sobre ${petData.type.toLowerCase()}s similares.`,
            },
            data: {
                petId: favoriteData.petId,
                action: "view_favorites",
                screen: "favorites",
            },
            token: userData.fcmToken, // Envia só para este usuário
        }

        await admin.messaging().send(message)
        console.log("Notificação de favorito enviada para:", userData.email)

        return { success: true }
    } catch (error) {
        console.error("Erro ao enviar notificação de favorito:", error)
        return { error: error.message }
    }
})

// Função para limpar notificações antigas (executa toda semana)
exports.cleanupOldNotifications = functions.pubsub
    .schedule("0 0 * * 0") // Todo domingo à meia-noite
    .timeZone("America/Sao_Paulo")
    .onRun(async (context) => {
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

        const oldNotifications = await admin.firestore().collection("notifications").where("sentAt", "<", oneWeekAgo).get()

        const batch = admin.firestore().batch()
        oldNotifications.docs.forEach((doc) => {
            batch.delete(doc.ref)
        })

        await batch.commit()
        console.log(`Removidas ${oldNotifications.size} notificações antigas`)

        return { cleaned: oldNotifications.size }
    })
