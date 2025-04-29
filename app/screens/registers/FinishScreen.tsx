import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useCadastro } from '../../app/registers/CadastroProvider';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator } from 'react-native';
import { db } from '../../config/firebase';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import {doc, setDoc} from 'firebase/firestore';



type User = {
  email: string;
  senha: string;
  nome: string;
  sobrenome: string;
  dataNascimento: string;
  cpf_user: string;
  telefone: string;
  rua: string;
  cidade: string;
  estado: string;
}


type CadastroContextType = {
  dados: User;
  setDados: (dados: User) => void;
};


export default function FinishScreen() {
  const router = useRouter();
  const { dados } = useCadastro() as CadastroContextType;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const auth = getAuth();


  useEffect(() => {
    const register_user = async () => {
      try{
        const userCredentials = await createUserWithEmailAndPassword(auth, dados.email, dados.senha);
        const user = userCredentials.user;

        const userRef = doc(db, 'users', user.uid);

        await setDoc(userRef, {
          email: dados.email,
          password: dados.senha,
          first_name: dados.nome,
          last_name: dados.sobrenome,
          birth_date: dados.dataNascimento,
          cpf: dados.cpf_user,
          telephone: dados.telefone,
          address: dados.rua,
          city: dados.cidade,
          state: dados.estado,
        })

        console.log('User registered');
      }catch(e: any){
        console.log(e);
        setError(e.message);
      }finally{
        setLoading(false);
      }
    }
    register_user();
  }, [dados, router]);


  return (
    <View style={styles.container}>
      <Ionicons name="paw" size={80} color="#FF6B6B" />
      <Text style={styles.title}>Patas Com Amor</Text>
      {loading ? (
        <>
          <Text style={styles.subtitle}>Registrando você e redirecionando...</Text>
          <ActivityIndicator size="large" color="#FF6B6B" style={styles.loader} />
        </>
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <Text style={styles.subtitle}>Redirecionando para nossos amigos peludos...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  loader: {
    marginTop: 20,
  },
  error: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 30,
  },

});