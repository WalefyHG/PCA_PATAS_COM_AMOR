
import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native'
import { useState } from 'react';
import { useCadastro } from '../../app/registers/CadastroProvider';
import Navbar from '../../components/NavBar';
import InputPassword from '../../components/InputPassword';
import { Input, Button } from '@ui-kitten/components';


export default function Screen1() {
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const router = useNavigation();
  const { dados, setDados } = useCadastro();

  const handleNext = () => {
    if (email !== confirmEmail) {
      alert('Os emails não coincidem');
      return;
    }

    if (senha !== confirmSenha) {
      alert('As senhas não coincidem');
      return;
    }

    setDados({ ...dados, email, senha });
    router.navigate(`Screen2` as never);
  };

  return (
    <View style={styles.container} className='overflow-x-hidden'>
      <Navbar />
      <View style={styles.content} className='overflow-x-hidden'>
        <Input
          label="Email"
          placeholder="Digite seu email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <Input
          label="Confirmar Email"
          placeholder="Confirme seu email"
          value={confirmEmail}
          onChangeText={setConfirmEmail}
          style={styles.input}
        />
        <InputPassword
          label="Senha"
          placeholder="Digite sua senha"
          value={senha}
          onChangeText={setSenha}
          style={styles.input}
        />
        <InputPassword
          label="Confirmar Senha"
          placeholder="Confirme sua senha"
          value={confirmSenha}
          onChangeText={setConfirmSenha}
          style={styles.input}
        />
        <View style={styles.dots}>
          <View style={styles.dotActive} />
          <View style={styles.dotInactive} />
          <View style={styles.dotInactive} />
        </View>
        
        <Button style={styles.button} onPress={handleNext}>
          Próximo
        </Button>
      </View>
      <View style={styles.bottomShape} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    minHeight: '100%',
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
    textAlign: 'center',
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    marginVertical: 5,
    marginBottom: 5,
  },
  input: {
    width: "100%",
    backgroundColor: 'none',
    padding: 10,
    marginBottom: 15,
    color: '#000',
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
    height: 50,
    backgroundColor: '#500000',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
  },
});