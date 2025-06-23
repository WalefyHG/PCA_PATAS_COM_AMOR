// functions/index.js

exports.notifyNewPet = functions.firestore
    .document('pets/{petId}') // Escuta a criação de novos documentos na coleção 'pets'
    .onCreate(async (snap, context) => {
        const newPet = snap.data();
        const petType = newPet.type; // Ex: "Gato", "Cachorro"
        const petName = newPet.name;
        const petId = snap.id; // ID do novo pet

        if (!petType) {
            console.log('Tipo de pet não encontrado, ignorando notificação.');
            return null;
        }

        // Garanta que o nome do tópico seja consistente com o que o cliente assina
        // Ex: "gato", "cachorro". Remova acentos e caracteres especiais.
        const topic = petType.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');

        const message = {
            notification: {
                title: 'Novo Pet Disponível para Adoção!',
                body: `Um(a) ${petName} (${petType}) acabou de ser adicionado(a)! Clique para ver.`,
                imageUrl: newPet.images && newPet.images[0] ? newPet.images[0] : undefined, // Primeira imagem do pet, se houver
            },
            data: {
                petId: petId,
                petType: petType,
                // Adicione quaisquer outros dados que você queira que o app receba
            },
            topic: topic,
            android: {
                priority: 'high',
                notification: {
                    channelId: 'default_channel', // Certifique-se de criar este canal no app Android
                },
            },
            apns: {
                payload: {
                    aps: {
                        sound: 'default',
                    },
                },
            },
        };

        try {
            const response = await admin.messaging().send(message);
            console.log('Mensagem enviada com sucesso para o tópico ' + topic + ':', response);
        } catch (error) {
            console.error('Erro ao enviar mensagem para o tópico ' + topic + ':', error);
        }

        return null;
    });