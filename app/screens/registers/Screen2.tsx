
import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { useCadastro } from '../../app/registers/CadastroProvider';
import { cpf } from 'cpf-cnpj-validator';
import { TextInputMask } from 'react-native-masked-text';
import Navbar from '../../components/NavBar';

export default function Screen2() {
    const [nome, setNome] = useState('');
    const [sobrenome, setSobrenome] = useState('');
    const [dataNascimento, setDataNascimento] = useState('');
    const [cpf_user, setCpfUser] = useState('');
    const { dados, setDados } = useCadastro();


    const router = useNavigation();

    const handleNext = () => {
        var cpf_replace = cpf_user.replace(/[^\d]+/g, '');
        const cpfValido = cpf.isValid(cpf_replace);

        if (!cpfValido) {
            alert('CPF inválido');
            return
        }


        setDados({ ...dados, nome, sobrenome, dataNascimento, cpf_user });
        router.navigate(`Screen3` as never);
    };

    return (
        <View style={styles.container} className='overflow-x-hidden'>
            <Navbar />
            <View style={styles.content}>
                <Text style={styles.title}>Cadastre-se Aqui</Text>
                <Text style={styles.label}>Nome:</Text>
                <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Digite seu nome" />
                <Text style={styles.label}>Sobrenome:</Text>
                <TextInput style={styles.input} value={sobrenome} onChangeText={setSobrenome} placeholder="Digite seu sobrenome" />
                <Text style={styles.label}>Data de Nascimento:</Text>
                <TextInput style={styles.input} value={dataNascimento} onChangeText={setDataNascimento} placeholder="DD/MM/AAAA" />
                <Text style={styles.label}>CPF:</Text>
                <TextInputMask type={'cpf'} style={styles.input} value={cpf_user} onChangeText={setCpfUser} placeholder="XXX.XXX.XXX-XX" />
                <View style={styles.dots}>
                    <View style={styles.dotInactive} />
                    <View style={styles.dotActive} />
                    <View style={styles.dotInactive} />
                </View>
                <TouchableOpacity style={styles.button} onPress={handleNext}>
                    <Text style={styles.buttonText}>Próximo</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.bottomShape} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'space-between',
        ...Platform.select({
            web: {
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
                minHeight: '100%',
            },
        }),
    },

    bottomShape: {
        display: 'flex',
        backgroundColor: '#E31E24',
        borderTopLeftRadius: 100,
        alignSelf: 'flex-end',
        ...Platform.select({
            web: {
                width: 500,
                height: 80,
            },
            android: {
                width: 200,
                height: 50,

            },
        }),
    },
    content: {
        display: 'flex',
        alignItems: 'center',
        padding: 20,
        ...Platform.select({
            web: {
                width: 800,
                marginVertical: 150,
            },
        }),
    },

    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 30,
    },
    label: {
        fontSize: 16,
        marginVertical: 5,
    },
    input: {
        width: "100%",
        borderBottomWidth: 1,
        borderBottomColor: '#e24b67',
        padding: 10,
        marginBottom: 25,
        color: '#000',
        ...Platform.select({
            web: {
                width: 500,
            },
        }),
    },
    dots: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 20,
    },
    dotInactive: {
        width: 10,
        height: 10,
        backgroundColor: '#ddd',
        borderRadius: 5,
        marginHorizontal: 5,
    },
    dotActive: {
        width: 10,
        height: 10,
        backgroundColor: '#500000',
        borderRadius: 5,
        marginHorizontal: 5,
    },
    button: {
        width: 200,
        backgroundColor: '#500000',
        borderRadius: 15,
        padding: 15,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});