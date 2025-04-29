import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { GoogleAuthProvider, signInWithCredential, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth } from '../config/firebase';
import { db } from '../config/firebase';
import {doc, getDoc, setDoc} from 'firebase/firestore';
import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin';
import { ref, getStorage, getDownloadURL } from 'firebase/storage';
import { uploadBytes } from 'firebase/storage';
import { Button, Input } from '@ui-kitten/components';
import InputPassword from '../components/InputPassword';

import { hideToastable, showToastable } from 'react-native-toastable';



export default function HomeScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useNavigation<any>();

  const handleLogin = async ()  => {
    try{
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        showToastable({message: 'Usuário logado com sucesso', status: 'success'});
        router.navigate('Tabs')
        
      } else {
        showToastable({message: 'Usuário ou senha inválidos', status: 'danger'});
      }
    }catch(e: any){
      showToastable({message: e.message, status: 'danger'});
    }
  };

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }else{
      GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_WEBCLIENTID,
        offlineAccess: true,
      });
      console.log("Configurado");
    }
  }, []);


  const handleGoogleLogin = async () => {
    try {
      let user;
      if (Platform.OS === 'web') {
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        user = userCredential.user;
      } else{
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        const response = await GoogleSignin.signIn();
        if (isSuccessResponse(response)){
          const googleCredential = GoogleAuthProvider.credential(response.data.idToken);
          const userCredential = await signInWithCredential(auth, googleCredential);
          user = userCredential.user;
        }
      }

      if (user) {
        const docRef = doc(db, 'users', user.uid);
        await setDoc(docRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        });

          console.log("Usuário logado com sucesso");
          router.navigate('Tabs');
      }
    }catch(e){
      console.log(e);
    }
  }

  return (
    <View style={styles.container} className='overflow-y-hidden'>
      <View style={styles.topShape} />

      <View style={styles.content}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} />
        <Text style={styles.platformIndicator}>
          {Platform.select({
            ios: 'Versão do App para iOS',
            android: 'Versão do App para Android',
            web: 'Versão do App para Web',
            default: 'Versão do App',
          })}
        </Text>

        <View className='flex justify-center w-full gap-8 p-2' >
          <Input
            style={styles.input}
            placeholder="Digite seu Email"
            placeholderTextColor="#000"
            label={'Email'}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <InputPassword
            style={styles.input}
            placeholder="Digite sua Senha"
            placeholderTextColor="#000"
            value={password}
            onChangeText={setPassword}
          />

        </View>

        <View className='flex-row justify-between w-full p-6'>
          <Button style={styles.enterButton} className='hover:bg-slate-800' onPress={handleLogin}>
            <Text style={styles.enterButtonText}>Entrar</Text>
          </Button>
          <Button style={styles.createAccountButton} className='hover:bg-red-900' onPress={() => router.navigate('registers')}>
            <Text style={styles.createAccountText}>Criar Conta</Text>
          </Button>
        </View>

        <Text style={styles.orText}>Ou</Text>
        <Text style={styles.socialText}>Entrar Com</Text>

        <View style={styles.socialContainer}>
          <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin}>
            <Image
              source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/2048px-Google_%22G%22_logo.svg.png' }}
              style={styles.socialIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Image
              source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg' }}
              style={styles.socialIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Image
              source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png' }}
              style={styles.socialIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomShape} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  topShape: {
    display: 'flex',
    backgroundColor: '#E31E24',
    borderBottomRightRadius: 100,
    alignSelf: 'flex-start',
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
    width: '100%',
    maxWidth: 400,
    padding: 20,
    alignItems: 'center',
    ...Platform.select({
      web: {
        maxWidth: 600,
      },
    }),
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  platformIndicator: {
    fontSize: 16,
    marginBottom: 20,
    color: '#E31E24',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    height: 50,
    paddingHorizontal: 20,
    marginBottom: 15,
    color: '#000',
    
  },
  enterButton: {
    backgroundColor: '#1A0F0F',
    borderWidth: 0,
  },
  enterButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  createAccountButton: {
    backgroundColor: '#E31E24',
    borderWidth: 0,
  },
  createAccountText: {
    color: '#fff',
    fontSize: 16,
  },
  orText: {
    marginTop: 30,
    fontSize: 16,
    color: '#000',
  },
  socialText: {
    marginTop: 10,
    marginBottom: 20,
    fontSize: 16,
    color: '#000',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  socialButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
},
socialIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
},
});
