import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { db, auth } from '../../config/firebase';
import { getDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';

interface User {
  uid: string;
  first_name?: string;
  displayName?: string;
  // Add other user properties here
}

export default function Home() {

  const router = useNavigation<any>();

  const [users, setUsers] = useState<User | null>(null);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUsers({ uid: currentUser.uid, first_name: userData.first_name, displayName: userData.displayName });
          } else {
            console.log('No such document!');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        console.log('No user is signed in.');
        setUsers(null);
      }
    });

    // Cleanup the subscription when the component unmounts
    return () => unsubscribe();
  }, []);

  return (
    <View className='flex-1 justify-center items-center bg-white'>
      <Text>Selecione um Usuário</Text>
      {users ? ( 
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            router.navigate('Profile',  { id: users.uid } );
          }}
        >
          <Text style={styles.buttonText}>{users.first_name || users.displayName}</Text>
        </TouchableOpacity>
      ) : (
        <Text>Nenhum usuário logado.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 18,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 10,
    marginVertical: 8,
    borderRadius: 5,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});