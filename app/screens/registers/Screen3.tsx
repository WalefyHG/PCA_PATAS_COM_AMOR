import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { useCadastro } from '../../app/registers/CadastroProvider';
import PhoneInput, { ICountry } from 'react-native-international-phone-number';
import Navbar from '../../components/NavBar';
import { Dropdown } from 'react-native-element-dropdown';

export default function Screen3() {

    const router = useNavigation();

    const [estado, setEstado] = useState<string | null>(null);
    const [cidade, setCidade] = useState<string | null>(null);
    const [rua, setRua] = useState<string | null>(null);
    const [telefone, setTelefone] = useState<string | undefined>(undefined);
    const { dados, setDados } = useCadastro();
    const [estados, setEstados] = useState<{ id: string; nome: string }[]>([]);
    const [cidades, setCidades] = useState<{ id: string; nome: string }[]>([]);
    const [country, setCountry] = useState<ICountry | null>(null);

    const handleEstados = async () => {
        fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
            .then((response) => response.json())
            .then((data) => {
                setEstados(data);
            });
    }

    const handleCidades = async () => {
        fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/distritos?orderBy=nome`)
            .then((response) => response.json())
            .then((data) => {
                setCidades(data);
            });
    }

    if (estados.length === 0) {
        try {
            handleEstados();
        } catch (e) {
            console.log(e);
        }
    }

    if (cidades.length === 0 && estado !== '') {
        try {
            handleCidades();
        } catch (e) {
            console.log(e);
        }
    }

    const handleSelectCountry = (country: ICountry) => {
        setCountry(country);
    }

    const handleSelectPhone = (phone: string) => {
        setTelefone(phone);
    }

    const handleFinish = () => {
        setDados({ ...dados, estado, cidade, rua, telefone });
        router.navigate(`FinishScreen` as never);
    };

    return (
        <View style={styles.container} className='overflow-x-hidden'>
            <Navbar />
            <View style={styles.content}>
                <Text style={styles.title}>Cadastre-se Aqui</Text>

                {/* Estado Dropdown */}
                <Text style={styles.label}>Estado:</Text>
                <Dropdown
                    style={styles.picker}
                    data={estados}
                    value={estado}
                    labelField="nome"
                    valueField="id"
                    placeholder="Selecione um estado"
                    onChange={(item) => setEstado(item.id)}
                />

                {/* Cidade Dropdown */}
                <Text style={styles.label}>Cidade:</Text>
                <Dropdown
                    style={styles.picker}
                    data={cidades}
                    value={cidade}
                    labelField="nome"
                    valueField="id"
                    placeholder="Selecione uma cidade"
                    onChange={(item) => setCidade(item.id)}
                />

                {/* Rua Input */}
                <Text style={styles.label}>Rua:</Text>
                <TextInput style={styles.inputs} value={rua ?? undefined} onChangeText={setRua} placeholder="Digite a Rua" />

                {/* Telefone Input */}
                <Text style={styles.label}>Telefone:</Text>
                <PhoneInput value={telefone ?? ''} phoneInputStyles={phoneInputStyles} modalStyles={modalStyles} language="pt" onChangeSelectedCountry={handleSelectCountry} selectedCountry={country} onChangePhoneNumber={handleSelectPhone} />

                {/* Finalizar Button */}
                <TouchableOpacity style={styles.button} onPress={handleFinish}>
                    <Text style={styles.buttonText}>Finalizar</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.bottomShape} />
        </View>
    );
}

const phoneInputStyles = {
    container: {
        width: 300,
        backgroundColor: 'transparent',
        borderBottomWidth: 2,
        borderBottomColor: '#e24b67',
        paddingVertical: 10,
        marginBottom: 15,
        ...Platform.select({
            web: {
                width: 500,
            },
        }),
    },
    flagContainer: {
        backgroundColor: 'transparent',
    },

    input: {
        outlineStyle: 'none',
        color: '#000',
    },

    callingCode: {
        fontSize: 16,
        color: '#000',
    },

    divider: {
        backgroundColor: '#000',
    },

}

const modalStyles = {
    flag: {
        width: 30,
        height: 30,
        color: '#000',
    }
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
        padding: 20,
        alignItems: 'center',
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
        textAlign: 'center',
        marginBottom: 30,
    },
    label: {
        fontSize: 16,
        marginVertical: 5,
    },
    inputs: {
        backgroundColor: 'transparent',
        borderBottomWidth: 1,
        borderBottomColor: '#e24b67',
        padding: 10,
        marginBottom: 15,
        width: 300,
        color: '#000',
        ...Platform.select({
            web: {
                width: 500,
            },
        }),
    },

    picker: {
        backgroundColor: 'transparent',
        borderBottomWidth: 1,
        borderBottomColor: '#e24b67',
        padding: 10,
        marginBottom: 15,
        width: 300,
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
        backgroundColor: '#500000',
        borderRadius: 15,
        padding: 15,
        alignItems: 'center',
        width: 200,
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
