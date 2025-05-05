import { useThemeContext } from '@/app/utils/ThemeContext';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';


export default function About() {

  const { paperTheme } = useThemeContext(); // Obtendo o tema do react-native-paper

  return (
    <View style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
      <Text style={[styles.title, { color: paperTheme.colors.onBackground }]}>Sobre</Text>
      <Text style={{ color: paperTheme.colors.onBackground }}>
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