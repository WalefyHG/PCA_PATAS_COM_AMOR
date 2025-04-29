import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';


export default function About() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sobre</Text>
      <Text>
        Este é um exemplo de aplicativo utilizando a biblioteca Expo Router.
      </Text>
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
});