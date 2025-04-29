import { Text, View, StyleSheet } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { db } from '../../config/firebase';
import { getDoc, doc } from 'firebase/firestore';

type RootStackParamList = {
  Profile: { id: string };
};

type ProfileRouteProp = RouteProp<RootStackParamList, 'Profile'>;

interface Profile {
  first_name?: string;
  last_name?: string;
  email?: string;
  cpf?: string;
  displayName?: string;
}

export default function Profile() {
  const route = useRoute<ProfileRouteProp>();
  const { id } = route.params;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'users', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as Profile);
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  return (
    <View style={styles.container}>
      {loading ? (
        <Text>Carregando...</Text>
      ) : profile ? (
        <>
          <Text>Nome: {profile.first_name || profile.displayName || 'Não informado'}</Text>
          <Text>Sobrenome: {profile.last_name || 'Não informado'}</Text>
          <Text>Email: {profile.email || 'Não informado'}</Text>
          <Text>CPF: {profile.cpf || 'Não informado'}</Text>
        </>
      ) : (
        <Text>Perfil não encontrado.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
